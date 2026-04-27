// same as play.js but for soundcloud.
// This doesn't work. I'm assuming I need Next Pro to access the SoundCloud API? Fairs bro
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    StreamType,
    entersState
} = require('@discordjs/voice');
const { PermissionsBitField } = require('discord.js');
const play = require('play-dl');

let scReady = false;

async function ensureSoundCloudAuth() {
  if (scReady) return;

  const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
  if (!clientId) {
    throw new Error('Missing SOUNDCLOUD_CLIENT_ID in environment.');
  }

  await play.setToken({
    soundcloud: {
      client_id: clientId
    }
  });

  scReady = true;
}

const fs = require('fs');

const INACTIVITY_MS = 2 * 60 * 1000;

async function resolveSoundCloudTrack(input) {
    const isUrl = /^https?:\/\//i.test(input);

    if (isUrl) {
        const info = await play.soundcloud(input);
        if (!info) return null;
        return {
            title: info.name || 'Unknown title',
            url: info.url || input,
            durationRaw: info.durationRaw || 'Unknown'
        };
    }

    const results = await play.search(input, {
        source: { soundcloud: 'tracks' },
        limit: 1
    });

    const first = results?.[0];
    if (!first) return null;

    return {
        title: first.name || 'Unknown title',
        url: first.url,
        durationRaw: first.durationRaw || 'Unknown'
    };
}

async function playTrack(client, guildId) {
    const session = client.voiceSessions?.get(guildId);
    if (!session) return;

    const next = session.queue.shift();

    if (!next) {
        if (session.inactivityTimeout) clearTimeout(session.inactivityTimeout);
        session.inactivityTimeout = setTimeout(async () => {
            const latest = client.voiceSessions?.get(guildId);
            if (!latest) return;
            if (latest.current || latest.queue.length > 0) return;

            const channel = latest.textChannelId
                ? await client.channels.fetch(latest.textChannelId).catch(() => null)
                : null;

            if (latest.connection) latest.connection.destroy();
            client.voiceSessions.delete(guildId);

            if (channel?.isTextBased()) {
                await channel.send('Left voice channel after 2 minutes of inactivity.');
            }
        }, INACTIVITY_MS);

        return;
    }

    if (session.inactivityTimeout) {
        clearTimeout(session.inactivityTimeout);
        session.inactivityTimeout = null;
    }

    session.current = next;
    session.current.startedAt = Date.now();

    const stream = await play.stream(next.url);
    const resource = createAudioResource(stream.stream, {
        inputType: stream.type || StreamType.Arbitrary
    });

    session.player.play(resource);
}

module.exports = {
    name: 'sc',
    aliases: ['soundcloud'],
    async execute(message, args) {
        try {
            await ensureSoundCloudAuth();

            if (!message.client.voiceSessions) {
                message.client.voiceSessions = new Map();
            }

            const query = args.join(' ').trim();
            if (!query) return message.reply('Usage: `,sc <soundcloud url or search>`');

            const voiceChannel = message.member?.voice?.channel;
            if (!voiceChannel) return message.reply("You're not in a voice channel.");

            const me = message.guild.members.me;
            if (!me) return message.reply('Could not verify bot member state.');

            const perms = voiceChannel.permissionsFor(me);
            if (!perms?.has(PermissionsBitField.Flags.Connect) || !perms?.has(PermissionsBitField.Flags.Speak)) {
                return message.reply('I need **Connect** and **Speak** in your voice channel.');
            }

            const resolved = await resolveSoundCloudTrack(query);
            if (!resolved?.url) return message.reply('No SoundCloud track found.');

            const track = {
                sourceType: 'soundcloud',
                title: resolved.title,
                url: resolved.url,
                durationRaw: resolved.durationRaw,
                requestedBy: message.member?.displayName || message.author.username,
                startedAt: null
            };

            let session = message.client.voiceSessions.get(message.guild.id);

            if (!session) {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                    selfDeaf: true
                });

                await entersState(connection, VoiceConnectionStatus.Ready, 30000);

                const player = createAudioPlayer();
                connection.subscribe(player);

                session = {
                    connection,
                    player,
                    current: null,
                    queue: [],
                    textChannelId: message.channel.id,
                    inactivityTimeout: null,
                    loopMode: 'off',
                    supportsSc: true
                };

                message.client.voiceSessions.set(message.guild.id, session);

                player.on(AudioPlayerStatus.Idle, async () => {
                    const active = message.client.voiceSessions.get(message.guild.id);
                    if (!active) return;

                    if (active.loopMode === 'track' && active.current) {
                        const stream = await play.stream(active.current.url);
                        const resource = createAudioResource(stream.stream, {
                            inputType: stream.type || StreamType.Arbitrary
                        });
                        active.current.startedAt = Date.now();
                        active.player.play(resource);
                        return;
                    }

                    if (active.loopMode === 'queue' && active.current) {
                        active.queue.push(active.current);
                    }

                    active.current = null;
                    await playTrack(message.client, message.guild.id);
                });

                player.on('error', async (err) => {
                    console.error('sc player error:', err);
                    const active = message.client.voiceSessions.get(message.guild.id);
                    if (!active) return;
                    active.current = null;
                    await playTrack(message.client, message.guild.id);
                });
            } else if (!session.supportsSc) {
                return message.reply('SoundCloud queueing into the current attachment session is not enabled yet. Next I can patch `play.js` so both sources work together.');
            }

            session.textChannelId = message.channel.id;
            session.queue.push(track);

            if (!session.current) {
                await playTrack(message.client, message.guild.id);
                return message.reply(`Playing now: **${track.title}**`);
            }

            return message.reply(`Queued **${track.title}** at position **${session.queue.length}**.`);
        } catch (err) {
            console.error('sc command failed:', err);
            return message.reply('Could not play SoundCloud track.');
        }
    }
};