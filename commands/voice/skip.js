module.exports = {
    name: 'skip',
    aliases: ['next', 'forward', 'nt', 'nexttrack'],
    async execute(message) {
        const session = message.client.voiceSessions?.get(message.guild.id);
        if (!session || !session.current) {
            return message.reply('Nothing is currently playing to skip.');
        }

        const currentName = session.current?.attachment?.name || 'current track';
        const nextName = session.queue?.[0]?.attachment?.name || null;

        session.player.stop(true);

        if (nextName) {
            return message.reply(`⏭ Skipped **${currentName}**. Next up: **${nextName}**`);
        }

        return message.reply(`⏭ Skipped **${currentName}**. Queue is now empty.`);
    }
};