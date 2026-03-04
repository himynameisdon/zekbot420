module.exports = {
    name: 'help',
    execute(message, args) {
      message.reply({
        content: `# Hi ${message.author}!\n\All commands are available on the [repository wiki](https://github.com/himynameisdon/zekbot420/wiki).\n\If you have any problems, visit the **[Issues tab](https://github.com/swagswagstar/himynameisdon/issues)** to report or see if it already is.`,
        allowedMentions: { repliedUser: false }
      });
    }
  };
  