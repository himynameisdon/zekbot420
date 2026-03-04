const { ActivityType } = require('discord.js');

module.exports = {
    name: 'status',
    async execute(message, args) {
        const client = message.client;

        const activityTypeRaw = (args[0] || 'play').toLowerCase();
        const activityText = args.slice(1).join(' ') || 'Something cool!';

        const typeMap = {
            play: ActivityType.Playing,
            watch: ActivityType.Watching,
            listen: ActivityType.Listening,
        };

        const type = typeMap[activityTypeRaw];
        if (!type) {
            return message.reply('Invalid activity type. Use "play", "watch", or "listen".');
        }

        await client.user.setActivity(activityText, { type });

        const pretty =
            activityTypeRaw === 'play' ? 'Playing' :
                activityTypeRaw === 'watch' ? 'Watching' :
                    'Listening';

        return message.reply(`Changed status to: ${pretty} ${activityText}`);
    }
};