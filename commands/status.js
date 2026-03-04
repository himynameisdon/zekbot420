module.exports = {
    name: 'status',
    execute(message, args) {
      const activityType = args[0]?.toLowerCase() || 'play';
      const activityText = args.slice(1).join(' ') || 'Something cool!';
      const validTypes = ['play', 'watch', 'listen'];
  
      if (!validTypes.includes(activityType)) {
        return message.reply('Invalid activity type. Use "play", "watch", or "listen".');
      }
  
      client.user.setActivity(activityText, { type: activityType.charAt(0).toUpperCase() + activityType.slice(1) });
      message.reply(`Changed status to: ${activityType.charAt(0).toUpperCase() + activityType.slice(1)} ${activityText}`);
    }
  };
  
// this command doesnt even work lol