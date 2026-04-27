const { createAudioResource } = require('@discordjs/voice');

module.exports = {
  name: 'restart',
  aliases: ['replay', 'rstart'],
  async execute(message) {
    const session = message.client.voiceSessions?.get(message.guild.id);
    if (!session || !session.current) {
      return message.reply('Nothing is currently playing to restart.');
    }

    try {
      const resource = createAudioResource(session.current.filePath);
      session.current.startedAt = Date.now();
      session.player.play(resource);

      return message.reply(`🔁 Restarted **${session.current.attachment?.name || 'current track'}**`);
    } catch (err) {
      console.error('restart command error:', err);
      return message.reply('Failed to restart the current track.');
    }
  }
};