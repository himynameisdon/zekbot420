// If it's a moderation command, import the log function
// const { addthefunctionfirst } = require('../log'); 

module.exports = {
  name: 'yourcommandname', // Replace with your command name
  aliases: ['ex'], // If you want a shorter alias, add it here
  execute(message, args) {

    // have fun lol
    
    message.reply('your message here lol'); // Replace with your message
  }
};
