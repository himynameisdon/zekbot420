module.exports = {
    name: 'ping',
    execute(message, args) {
      message.reply({
        content: 'Pong!',
        allowedMentions: { repliedUser: false }
      });
    }
  };
  