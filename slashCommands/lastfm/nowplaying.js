const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

const dbPath = path.join(__dirname, '../../data/lastfm.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show your current or most recently played track (Last.fm)')
        .addStringOption((opt) =>
            opt
                .setName('username')
                .setDescription('Last.fm username (optional if linked)')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const username = interaction.options.getString('username') || db[interaction.user.id];

        if (!username) {
            return interaction.editReply('Provide a Last.fm username or link your account first.');
        }

        const apiKey = process.env.LASTFM_API_KEY;
        if (!apiKey) return interaction.editReply('Missing `LASTFM_API_KEY` in the bot environment.');

        const url =
            `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks` +
            `&user=${encodeURIComponent(username)}` +
            `&api_key=${encodeURIComponent(apiKey)}` +
            `&format=json&limit=1`;

        try {
            const { data } = await axios.get(url);
            const track = data?.recenttracks?.track?.[0];

            if (!track) return interaction.editReply(`No recent tracks found for **${username}**.`);

            const isPlaying = track['@attr']?.nowplaying === 'true';
            const song = track?.name;
            const artist = track?.artist?.['#text'];
            const album = track?.album?.['#text'];
            const albumArt = track?.image?.[3]?.['#text'] || track?.image?.at?.(-1)?.['#text'] || null;
            const trackUrl = track?.url;

            let userPlayCount = null;
            let userLoved = false;

            try {
                const infoUrl =
                    `https://ws.audioscrobbler.com/2.0/?method=track.getInfo` +
                    `&api_key=${encodeURIComponent(apiKey)}` +
                    `&format=json` +
                    `&username=${encodeURIComponent(username)}` +
                    `&artist=${encodeURIComponent(artist || '')}` +
                    `&track=${encodeURIComponent(song || '')}`;

                const { data: infoData } = await axios.get(infoUrl);

                const count = infoData?.track?.userplaycount;
                if (count !== undefined && count !== null && count !== '') {
                    userPlayCount = Number(count);
                }

                const loved = infoData?.track?.userloved;
                userLoved = loved === '1' || loved === 1 || loved === true;
            } catch (err) {
                console.log('Error fetching track info:', err.response?.data || err.message);
            }

            const playsText =
                typeof userPlayCount === 'number' && Number.isFinite(userPlayCount)
                    ? ` • ${userPlayCount.toLocaleString()} play${userPlayCount === 1 ? '' : 's'}`
                    : '';

            const footerLabel = userLoved ? '❤️ Loved track' : 'Last.fm';

            const embed = {
                color: 0xd51007,
                author: { name: isPlaying ? '🎵 Now Playing' : '⏮ Last Played' },
                title: song || 'Unknown track',
                url: trackUrl || undefined,
                description: artist ? `by **${artist}**${album ? ` • *${album}*` : ''}` : undefined,
                thumbnail: albumArt ? { url: albumArt } : undefined,
                footer: { text: `${footerLabel} • ${username}${playsText}` }
            };

            return interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.log(e.response?.data || e.message);
            return interaction.editReply("Couldn't find that Last.fm user. Double-check the username!");
        }
    }
};