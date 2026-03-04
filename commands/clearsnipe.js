const { logSnipeClear } = require('../log');

module.exports = {
  name: 'clearsnipe',
  aliases: ['cs'],
  execute(message, args) {
    const channel = message.channel;
    const snipeData = message.client.snipes.get(channel.id);

    if (!snipeData) {
      return message.reply('No snipe data to clear in this channel.');
    }

    message.client.snipes.delete(channel.id);
    
    logSnipeClear(message.client, message, message.author);

    message.reply('✅');
  }
};
