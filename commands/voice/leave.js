const { getVoiceConnection } = require('@discordjs/voice');
const fs = require('fs');

module.exports = {
    name: 'leave',
    aliases: ['dc', 'disconnect'],
    async execute(message) {
        const session = message.client.voiceSessions?.get(message.guild.id);
        const connection = getVoiceConnection(message.guild.id);

        if (!session && !connection) {
            return message.reply("I'm currently not in a voice channel. <:smirk:1498272372539785286>");
        }

        try {
            if (session) {
                if (session.inactivityTimeout) {
                    clearTimeout(session.inactivityTimeout);
                    session.inactivityTimeout = null;
                }

                if (session.current?.filePath && fs.existsSync(session.current.filePath)) {
                    fs.unlinkSync(session.current.filePath);
                }

                for (const item of session.queue || []) {
                    if (item?.filePath && fs.existsSync(item.filePath)) fs.unlinkSync(item.filePath);
                }

                session.queue = [];
                session.current = null;

                session.player.stop(true);
                message.client.voiceSessions.delete(message.guild.id);
            }

            if (connection) connection.destroy();

            return message.reply('👋 Left the voice channel and cleared queue.');
        } catch (err) {
            console.error('leave command error:', err);
            return message.reply('Failed to leave the voice channel. <:smirk:1498272372539785286>');
        }
    }
};