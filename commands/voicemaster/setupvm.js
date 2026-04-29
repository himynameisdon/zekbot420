const { PermissionsBitField } = require('discord.js');
const { setupVoiceMaster } = require('./vmManager');

module.exports = {
    name: 'setupvm',
    aliases: ['setupvoicemaster'],
    async execute(message) {
        if (
            !message.member.permissions.has(PermissionsBitField.Flags.Administrator) &&
            message.author.id !== message.guild.ownerId
        ) {
            return message.reply('You do not have the required permissions to run this command.');
        }

        return setupVoiceMaster(message);
    },
};