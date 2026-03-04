const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../modlogConfig.json');

module.exports = {
  name: 'modlog',
  aliases: ['log'],
  async execute(message, args) {
    if (!message.member.permissions.has('Administrator') && message.author.id !== message.guild.ownerId)
      return message.reply({ content: 'You do not have the required permissions to run this command.' });

    const channelInput = args[0];
    if (!channelInput)
      return message.reply({ content: 'Please provide a valid channel name or ID to log events.' });

    let channel = message.guild.channels.cache.get(channelInput);
    if (!channel) {
      channel = message.guild.channels.cache.find(ch => ch.name.replace(/\s+/g, '').toLowerCase() === channelInput.replace(/\s+/g, '').toLowerCase());
    }

    if (!channel)
      return message.reply({ content: 'Could not find that channel. Please make sure the name or ID is correct.' });

    let config = {};
    if (fs.existsSync(configPath)) config = JSON.parse(fs.readFileSync(configPath));
    config[message.guild.id] = channel.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    message.reply({ content: `Modlog channel has been set to ${channel}.` });
  }
};
