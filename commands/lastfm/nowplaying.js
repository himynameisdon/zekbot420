const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../data/lastfm.json');

module.exports = {
  name: 'nowplaying',
  aliases: ['np', 'fm', 'lastplayed'],
  async execute(message, args) {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const username = args[0] || db[message.author.id];
    if (!username) return message.reply('Provide a Last.fm username! e.g. `,np username`');

    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${username}&api_key=${process.env.LASTFM_API_KEY}&format=json&limit=1`;

    try {
      const { data } = await axios.get(url);
      const track = data.recenttracks.track[0];

      if (!track) return message.reply(`No recent tracks found for **${username}**.`);

      const isPlaying = track['@attr']?.nowplaying === 'true';
      const song = track.name;
      const artist = track.artist['#text'];
      const album = track.album['#text'];
      const albumArt = track.image[3]['#text'];
      const trackUrl = track.url;

      let userPlayCount = null;
      let userLoved = false;

      try {
        const infoUrl =
          `https://ws.audioscrobbler.com/2.0/?method=track.getInfo` +
          `&api_key=${process.env.LASTFM_API_KEY}` +
          `&format=json` +
          `&username=${encodeURIComponent(username)}` +
          `&artist=${encodeURIComponent(artist)}` +
          `&track=${encodeURIComponent(song)}`;

        const { data: infoData } = await axios.get(infoUrl);

        const count = infoData?.track?.userplaycount;
        if (count !== undefined && count !== null && count !== '') {
          userPlayCount = Number(count);
        }

        const loved = infoData?.track?.userloved;
        userLoved = loved === '1' || loved === 1 || loved === true;
      } catch (err) {
        console.log('Error fetching track info:', err.response?.data || err.message);
      }

      const playsText =
        typeof userPlayCount === 'number' && Number.isFinite(userPlayCount)
          ? ` • ${userPlayCount.toLocaleString()} play${userPlayCount === 1 ? '' : 's'}`
          : '';

      const footerLabel = userLoved ? '❤️ Loved track' : 'Last.fm';

      const embed = {
        color: 0xd51007,
        author: { name: isPlaying ? '🎵 Now Playing' : '⏮ Last Played' },
        title: song,
        url: trackUrl || undefined,
        description: `by **${artist}**${album ? ` • *${album}*` : ''}`,
        thumbnail: albumArt ? { url: albumArt } : null,
        footer: { text: `${footerLabel} • ${username}${playsText}` }
      };

      message.reply({ embeds: [embed] });
    } catch (e) {
      console.log(e.response?.data || e.message);
      message.reply('Couldn\'t find that Last.fm user. Double-check the username!');
    }
  }
};