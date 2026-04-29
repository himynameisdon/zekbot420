const {
    getManagedChannel,
    isVoiceMasterOrStaff,
    deleteManagedChannel,
} = require('./vmManager');

module.exports = {
    name: 'dvc',
    aliases: ['deletevc'],
    async execute(message) {
        const voiceChannel = message.member?.voice?.channel;

        if (!voiceChannel) {
            return message.reply('You need to be in a VoiceMaster VC to use this command.');
        }

        const managed = getManagedChannel(message.client, voiceChannel.id);

        if (!managed) {
            return message.reply('This is not a VoiceMaster VC.');
        }

        if (!isVoiceMasterOrStaff(message.member, managed)) {
            return message.reply('Only the voicemaster or staff with **Manage Channels** can use this command.');
        }

        await message.reply('Deleting this VoiceMaster VC.');
        await deleteManagedChannel(message.client, voiceChannel.id, `VoiceMaster VC deleted by ${message.author.tag}`);
    },
};