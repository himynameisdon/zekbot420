<img width="128" height="128" alt="6ce517a4d6c725cd1b7cb51a4e4a1465" src="https://github.com/user-attachments/assets/9b181455-dc7a-4f1c-907d-ae573f10a8f6" />

# zekbot420

Your favorite Discord bot's open-source alternative.

---

## Features

### Moderation
- Ban / unban
- Kick
- Timeout / untimeout
- Clear messages
- Warn system (warn, unwarn, list warnings)

### Utility & Info
- Ping / uptime
- Avatar lookup
- Polls
- Status helpers
- Help command
- Basic server/user info

### Logging 
- Logs support (stores moderation actions)
- Welcome setup + welcoming messages
- “Snipe” / “clearsnipe” style message recall 

### Integrations
- Last.fm commands (optional; requires API key)

---

## Requirements

- **Node.js** (recommended: current LTS)
- **npm**
- A Discord application + bot token
- Permissions to add a bot to a server

---

## Installation

```shell script
npm install
```


---

## Configuration

This project uses both a `.env` file and a `config.json`.

### 1) Create `.env`

Add a `.env` file in the project root (or edit the existing one) with placeholders like:

```
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN
LASTFM_API_KEY=YOUR_LASTFM_API_KEY
# Add other environment variables your setup requires
```


> Reminder to NEVER commit `.env` files to a public repo.

### 2) Edit `config.json`

Open `config.json` and set the values for your bot/server (typical examples include client/app ID, guild ID for development, log channel IDs, etc.).

If you’re not sure what a field does:
- Search for the key name across the project
- Update it gradually (start with token + basic IDs) and run the bot to verify

---

## Running the bot

```shell script
node index.js
```


Or, if you prefer a package script (if present in `package.json`):

```shell script
npm run start
```


---

## Slash Commands (Deploying)

If your bot uses slash commands, you’ll typically need to register them with Discord after changing or adding commands.

Run the deploy script:

```shell script
node deploy-commands.js
```

Notes:
- Global command registration can take time to propagate.
- For faster iteration, configure a development guild and register commands to that guild while testing.

---

## Data & Persistence

Some features store data locally (for example: warnings/modlog/Last.fm configuration). You’ll see data files under the `data/` directory.

If you deploy to a platform with ephemeral storage, consider migrating persistence to a database or mounted volume.

---

## Project Structure (high level)

- `index.js` — bot entry point
- `commands/` — message/prefix style commands (organized by category)
- `slashCommands/` — slash command handlers/definitions
- `welcoming.js` / `welcomesetup.js` — welcoming flow
- `storesnipe.js` / `snipe.js` — message snipe support
- `deploy-commands.js` — registers slash commands with Discord
- `data/` — local JSON storage (warnings, modlog, lastfm config, etc.)

---

## Common Issues

### Bot starts but commands don’t work
- Confirm the bot is invited with the right scopes/permissions:
    - `bot`
    - `applications.commands` (for slash commands)
- Re-run command deployment:
```shell script
node deploy-commands.js
```


### “Missing Access” / permission errors
- Ensure the bot role is high enough in the server role hierarchy
- Ensure the bot has permission to manage messages/moderate members where needed

### Intents-related issues
- Make sure the required Gateway Intents are enabled in the Discord Developer Portal for your bot (and configured in code if applicable)

---

## Contributing

Contributions are welcome—bug fixes, new commands, improvements to docs, etc.

Suggested workflow:
1. Fork the repo
2. Create a feature branch
3. Make changes
4. Open a PR with a clear description and testing notes

---

## License

This project is licensed under the MIT license.

---
