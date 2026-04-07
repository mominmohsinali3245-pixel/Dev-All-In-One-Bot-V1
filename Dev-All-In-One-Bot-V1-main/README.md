# AeroX AIO V1 - Discord Bot

A powerful all-in-one Discord bot built with Discord.js v14+ featuring music playback, advanced moderation, ticketing, leveling, and 100+ utility commands.

## 🎯 What is AeroX?

AeroX AIO V1 is a feature-rich Discord bot designed to handle all your server needs in one package. From playing music to managing tickets, from automod to fun games - this bot does it all.

## ✨ Key Features

### 🎵 Music System
- High-quality music playback via Lavalink
- YouTube Music integration
- Queue management with interactive controls
- Beautiful music cards with now playing display
- Playlist support and loop modes

### 🛡️ Advanced Moderation
- **AutoMod System**: Anti-spam, anti-link, anti-caps, anti-invite, anti-mention spam
- **Raid Protection**: Automatic raid detection and prevention
- **Banned Words Filter**: Customizable word blacklist
- **User Management**: Ban, kick, timeout, warn, role management
- **Channel Tools**: Lockdown, slowmode, purge messages
- **Smart Ignore System**: Channel and role exceptions

### 🎫 Ticket System
- Multi-category support (open, closed, archived)
- Transcript generation for ticket logs
- Button-based controls (create, close, reopen, delete)
- Staff role management

### 📊 Leveling & XP
- Message-based XP accumulation
- Custom level-up channels
- Leaderboard system
- Rank cards with canvas graphics

### 🎁 Giveaway System
- Duration-based giveaways
- Automatic winner selection
- Entry tracking and management
- Modern Components v2 UI

### 💡 Suggestion System
- Upvote/downvote tracking
- Staff management (accept/decline)
- User vote tracking to prevent duplicates

### 🔐 Security & Verification
- CAPTCHA-based verification system
- Anti-ghostping protection
- User blacklist system

### 🎮 Community Features
- **Join-to-Create**: Dynamic voice channels
- **Confess System**: Anonymous confessions
- **Counting Game**: Server-wide counting
- **Marriage System**: User relationships
- **AFK System**: Away status tracking
- **Games**: Interactive Discord games
- **Fun Commands**: Memes, jokes, and entertainment

### 🛠️ Utilities
- Translation support (Google Translate)
- Image generation and manipulation
- Canvas-based profile cards
- Reminder system
- Weather information
- Calculator and tools
- Auto-responder

## 🚀 Setup Instructions

### Prerequisites
- Node.js v20.9.0 or higher
- MongoDB database
- Discord Bot Token
- Lavalink server (optional, for music)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <repo-folder>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   token=YOUR_DISCORD_BOT_TOKEN
   mongodb=YOUR_MONGODB_CONNECTION_STRING
   ```

4. **Configure bot settings**
   
   Edit `AeroX-AIO-V1/config.json`:
   ```json
   {
     "prefix": ",",
     "developerid": "YOUR_DISCORD_ID",
     "clientID": "YOUR_BOT_CLIENT_ID",
     "logchannel": "CHANNEL_ID_FOR_LOGS",
     "bugreport": "CHANNEL_ID_FOR_BUG_REPORTS",
     "feedback": "CHANNEL_ID_FOR_FEEDBACK"
   }
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

### Getting Your Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select existing one
3. Go to "Bot" section
4. Click "Reset Token" and copy your token
5. Paste it in your `.env` file

### Inviting Your Bot

Generate an invite link from the Discord Developer Portal OAuth2 section with the required permissions.

## 📦 Dependencies

Key packages used:
- `discord.js` - Discord API wrapper
- `mongoose` - MongoDB object modeling
- `canvas` / `canvacard` - Image generation
- `discord-gamecord` - Interactive games
- `node-schedule` - Task scheduling
- `axios` - HTTP requests
- And many more utilities!

## 🎨 Commands

### Command Categories
- **Automod** - Automated moderation tools
- **Setup** - Bot configuration commands
- **Moderation** - Manual moderation actions
- **Fun** - Entertainment commands
- **Giveaways** - Giveaway management
- **Information** - Bot and server info
- **Music** - Music playback controls
- **Images** - Image manipulation
- **Utilities** - Helpful utilities
- **Tools** - Calculation, translation, etc.
- **YouTube** - YouTube notifications

Use `/help` or `,help` to see all available commands!

## 👨‍💻 Development Credits

**Developer**: [itsfizys](https://itsfiizys.com)

**Support Server**: [AeroX Dev](https://discord.gg/8wfT8SfB5Z)

### Special Thanks
- Discord.js community
- All the amazing open-source library contributors

## 🔧 Configuration

### Prefix Commands
Default prefix: `,` (configurable in config.json)

### Slash Commands
All commands support Discord's native slash command interface

### Permissions
The bot requires the following permissions:
- Manage Server
- Manage Roles
- Manage Channels
- Manage Messages
- Read Messages/View Channels
- Send Messages
- Embed Links
- Attach Files
- Connect & Speak (for music)
- And more...

## 📝 License

This project is private. All rights reserved.

## 🐛 Bug Reports & Suggestions

Found a bug or have a suggestion?
- Use `/bot report-bug` command
- Use `/bot suggest` command
- Or join our [Support Server](https://discord.gg/8wfT8SfB5Z)

## 🔗 Links

- **Developer Website**: [itsfiizys.com](https://itsfiizys.com)
- **Support Server**: [discord.gg/8wfT8SfB5Z](https://discord.gg/8wfT8SfB5Z)

---

Made with ❤️ by itsfizys | AeroX Development Team
