module.exports = {
  name: 'pause',
  aliases: ['resume'],
  async execute(message) {
    const session = message.client.voiceSessions?.get(message.guild.id);
    if (!session) return message.reply('Nothing is playing right now. <:smirk:1498272372539785286>');

    const wasPaused = session.player.state.status === 'paused';
    if (wasPaused) {
      session.player.unpause();
      return message.reply('▶️ Resumed.');
    }

    const paused = session.player.pause();
    if (!paused) return message.reply('Could not pause playback. <:smirk:1498272372539785286>');
    return message.reply('⏸ Paused. \n\-# Tip: To unpause, run `,pause` again.');
  }
};