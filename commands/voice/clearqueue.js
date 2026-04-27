const fs = require('fs');

module.exports = {
    name: 'clearqueue',
    aliases: ['cq', 'clearq'],
    async execute(message) {
        const session = message.client.voiceSessions?.get(message.guild.id);
        if (!session) return message.reply('There is no active queue right now.');

        const queued = session.queue || [];
        if (queued.length === 0) {
            return message.reply('Queue is already empty.');
        }

        for (const item of queued) {
            if (item?.filePath && fs.existsSync(item.filePath)) fs.unlinkSync(item.filePath);
        }

        const count = queued.length;
        session.queue = [];

        return message.reply(`Cleared **${count}** queued track(s). Current track keeps playing.`);
    }
};