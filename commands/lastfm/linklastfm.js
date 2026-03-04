const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/lastfm.json');

module.exports = {
  name: 'linklastfm',
  aliases: ['setfm', 'linkfm'],
  execute(message, args) {
    const username = args[0];
    if (!username) return message.reply('Provide a Last.fm username! e.g. `,linklastfm username`');

    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    db[message.author.id] = username;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    message.reply(`✅ Linked your account to **${username}** on Last.fm!`);
  }
};