const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help with zekbot420')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2),

    async execute(interaction) {
        await interaction.reply({
            content: `# Hi ${interaction.user}!\nAll commands are available on the [repository wiki](https://github.com/himynameisdon/zekbot420/wiki).\nIf you have any problems, visit the **[Issues tab](https://github.com/swagswagstar/himynameisdon/issues)** to report or see if it already is.`,
            allowedMentions: { repliedUser: false }
        });
    }
};