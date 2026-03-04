const { logMessageDeletion } = require('./log');

module.exports = (client) => {
  client.snipes = new Map();

  client.on('messageDelete', async message => {
    if (!message.guild || message.author?.bot) return;

    const snipes = client.snipes.get(message.channel.id) || [];

    snipes.unshift({
      content: message.content || '[No content]',
      user: message.author,
      timestamp: Date.now()
    });

    if (snipes.length > 20) snipes.pop();

    client.snipes.set(message.channel.id, snipes);

    await logMessageDeletion(client, message, message.author);
  });
};
