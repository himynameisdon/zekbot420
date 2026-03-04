const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

const dbPath = path.join(__dirname, '../../data/lastfm.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cover')
        .setDescription('Show the album cover for your last played track (Last.fm)')
        .addStringOption((opt) =>
            opt
                .setName('username')
                .setDescription('Last.fm username (optional if linked)')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const username = interaction.options.getString('username') || db[interaction.user.id];

        if (!username) {
            return interaction.editReply('Provide a Last.fm username or link your account first.');
        }

        const apiKey = process.env.LASTFM_API_KEY;
        if (!apiKey) return interaction.editReply('Missing `LASTFM_API_KEY` in the bot environment.');

        const recentUrl =
            `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks` +
            `&user=${encodeURIComponent(username)}` +
            `&api_key=${encodeURIComponent(apiKey)}` +
            `&format=json&limit=1`;

        try {
            const { data } = await axios.get(recentUrl);
            const track = data?.recenttracks?.track?.[0];

            if (!track) return interaction.editReply(`No recent tracks found for **${username}**.`);

            const song = track?.name;
            const artist = track?.artist?.['#text'];
            const album = track?.album?.['#text'];

            if (!artist || !album) {
                return interaction.editReply(`I couldn't determine the album for **${song || 'that track'}**.`);
            }

            const albumInfoUrl =
                `https://ws.audioscrobbler.com/2.0/?method=album.getInfo` +
                `&api_key=${encodeURIComponent(apiKey)}` +
                `&format=json` +
                `&artist=${encodeURIComponent(artist)}` +
                `&album=${encodeURIComponent(album)}`;

            const { data: albumData } = await axios.get(albumInfoUrl);

            const images = albumData?.album?.image || [];
            const pick = (size) => images.find((img) => img.size === size)?.['#text'];

            const coverUrl =
                pick('extralarge') ||
                pick('mega') ||
                pick('large') ||
                pick('medium') ||
                pick('small') ||
                null;

            if (!coverUrl) return interaction.editReply(`No album cover found for **${artist} — ${album}**.`);

            const albumUrl = albumData?.album?.url;

            const embed = {
                color: 0xd51007,
                title: `${artist} — ${album}`,
                url: albumUrl || undefined,
                description: song ? `Track: **${song}**` : undefined,
                image: { url: coverUrl },
                footer: { text: `Last.fm • ${username}` }
            };

            return interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.log(e.response?.data || e.message);
            return interaction.editReply('Couldn’t fetch the album cover right now—try again in a moment.');
        }
    }
};