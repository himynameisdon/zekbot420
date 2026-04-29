# zekbot420: VoiceMaster
This feature allows you to create and control your own voice channels.
## Usage
`,setupvm`: Set up VoiceMaster. Enter a category ID and that's where the *Join to Create* VC will appear.

Once set up, users can join the "Join to Create" VC to automatically create their own temporary voice channel. They will be made the owner of that channel and can control it with the following commands:
- `,dvc`: Delete the voice channel
- `,kvc <user>`: Kick a user from the voice channel
- `,lvc`: Lock the voice channel (prevents new users from joining)
- `,rmvc`: Rename the voice channel
- `,sl <number>`: Set the user limit for the voice channel (2-99, blank or 0 for no limit, 1 is rejected)

Not content? Messed something up? Run `,unsetupvm` to remove the *Join to Create* VC and delete all temporary voice channels created by the bot. You can then run `,setupvm` again to start fresh.