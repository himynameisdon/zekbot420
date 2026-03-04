const fs = require('fs');
const path = require('path');
const {Client, GatewayIntentBits, Collection, Partials} = require('discord.js');

require('dotenv').config();

const {logMessageDeletion, logSnipeClear} = require('./log');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();
client.slashCommands = new Collection();
client.snipes = new Map();
client.reactionSnipes = new Map();

const commandsPath = './commands';
const commandItems = fs.readdirSync(commandsPath, {withFileTypes: true});

for (const item of commandItems) {
    if (item.isFile() && item.name.endsWith('.js')) {
        const command = require(`./commands/${item.name}`);
        client.commands.set(command.name, command);
    } else if (item.isDirectory()) {
        const subFiles = fs.readdirSync(path.join(commandsPath, item.name)).filter(file => file.endsWith('.js'));
        for (const file of subFiles) {
            const command = require(`./commands/${item.name}/${file}`);
            client.commands.set(command.name, command);
        }
    }
}

const slashCommandsPath = path.join(__dirname, 'slashCommands');
if (fs.existsSync(slashCommandsPath)) {
    const walk = (dir) => {
        const entries = fs.readdirSync(dir, {withFileTypes: true});
        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.isFile() && entry.name.endsWith('.js')) {
                const slashCommand = require(full);
                if (!slashCommand?.data?.name || typeof slashCommand.execute !== 'function') continue;
                client.slashCommands.set(slashCommand.data.name, slashCommand);
            }
        }
    };
    walk(slashCommandsPath);
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('drake maye interception compilations', {type: 3});
});

// Slash commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd) return;

    try {
        await cmd.execute(interaction);
    } catch (error) {
        console.error(error);
        const payload = {content: 'There was an error executing that command.', ephemeral: true};
        if (interaction.deferred || interaction.replied) await interaction.followUp(payload);
        else await interaction.reply(payload);
    }
});

    // Prefix commands
    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.content.startsWith(process.env.PREFIX)) return;

        const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.find(
            cmd => cmd.name === commandName || (cmd.aliases && cmd.aliases.includes(commandName))
        );

        if (!command) return;

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            await message.reply('There was an error executing that command.');
        }
    });

client.on('messageCreate', async message => {
    if (message.content === ',cs' || message.content === ',clearsnipe') {
        await logSnipeClear(client, message, message.author);
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch {
            return;
        }
    }

    client.reactionSnipes.set(reaction.message.channel.id, {
        emoji: reaction.emoji.toString(),
        user: user.tag,
        message: reaction.message.content || '[no text]',
        messageAuthor: reaction.message.author?.tag || 'Unknown',
        time: Date.now()
    });

    setTimeout(() => {
        client.reactionSnipes.delete(reaction.message.channel.id);
    }, 60000);
});

client.login(process.env.TOKEN);
require('./storesnipe')(client);