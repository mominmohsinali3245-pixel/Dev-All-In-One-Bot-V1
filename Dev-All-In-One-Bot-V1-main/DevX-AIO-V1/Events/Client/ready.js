const { Client, ActivityType } = require("discord.js");
const { mongoose } = require("mongoose");
const mongo = process.env.mongodb;

class Colors {
  static CYAN = '\x1b[96m';
  static BLUE = '\x1b[94m';
  static GREEN = '\x1b[92m';
  static PINK = '\x1b[38;5;213m';
  static PURPLE = '\x1b[38;5;141m';
  static WHITE = '\x1b[97m';
  static GRAY = '\x1b[90m';
  static RESET = '\x1b[0m';
  static BOLD = '\x1b[1m';
  static DIM = '\x1b[2m';
}

function printHeader() {
  console.log(`\n${Colors.CYAN}╭─────────────────────────────────────────────────────────────╮${Colors.RESET}`);
  console.log(`${Colors.CYAN}│${Colors.RESET}                ${Colors.BOLD}${Colors.PURPLE}✦ AeroX AIO V1 ✦${Colors.RESET}                ${Colors.CYAN}│${Colors.RESET}`);
  console.log(`${Colors.CYAN}│${Colors.RESET}         ${Colors.DIM}${Colors.WHITE}Elegant • Intelligent • Sophisticated${Colors.RESET}         ${Colors.CYAN}│${Colors.RESET}`);
  console.log(`${Colors.CYAN}╰─────────────────────────────────────────────────────────────╯${Colors.RESET}\n`);
}

function printSuccess(message) {
  console.log(`${Colors.GREEN}✓${Colors.RESET} ${Colors.WHITE}${message}${Colors.RESET}`);
}

function printInfo(message) {
  console.log(`${Colors.CYAN}◆${Colors.RESET} ${Colors.WHITE}${message}${Colors.RESET}`);
}

function printBotReady(botName) {
  console.log(`\n${Colors.CYAN}◆${Colors.RESET} ${Colors.BOLD}${Colors.GREEN}Authenticated${Colors.RESET} ${Colors.DIM}→${Colors.RESET} ${Colors.PURPLE}${botName}${Colors.RESET}`);
}

function printSystemReady() {
  const separator = `${Colors.CYAN}─${Colors.PURPLE}─${Colors.BLUE}─${Colors.RESET}`;
  console.log(`   ${separator.repeat(20)}`);
  console.log(`\n   ${Colors.BOLD}${Colors.PURPLE}✦ System Operational ✦${Colors.RESET}`);
  console.log(`   ${Colors.DIM}${Colors.WHITE}Developed with ${Colors.PINK}♡${Colors.WHITE} by AeroX Development${Colors.RESET}`);
  console.log(`   ${Colors.DIM}${Colors.GRAY}Ready to serve with elegance and precision${Colors.RESET}\n`);
  console.log(`   ${separator.repeat(20)}\n`);
}

module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    printHeader();

    // Print loaded counts after header
    const eventCount = client.events.size;
    const prefixCount = client.pcommands.size;
    const modalCount = client.modals.size;
    const buttonCount = client.buttons.size;
    const commandCount = client.commands.size;
    
    printSuccess(`Loaded ${eventCount} events`);
    printSuccess(`Loaded ${prefixCount} prefix commands`);
    printSuccess(`Loaded ${modalCount} modals`);
    printSuccess(`Loaded ${buttonCount} buttons`);
    printSuccess(`Loaded ${commandCount} commands`);
    console.log(); // Empty line for spacing

    // Initialize Riffy (Lavalink)
    if (client.riffy) {
      try {
        await client.riffy.init(client.user.id);
        printSuccess("Music system initialized");
      } catch (error) {
        console.error(`${Colors.RED}✗${Colors.RESET} Music system error: ${error.message}`);
      }
    }

    mongoose.set("strictQuery", true);
    
    try {
      printInfo("Initializing database connection");

      mongoose.connection.on("connected", () => {
        printSuccess("Database connection established");
      });

      mongoose.connection.on("error", (error) => {
        console.error(`${Colors.RED}✗${Colors.RESET} Database error: ${error.message}`);
      });

      await mongoose.connect(mongo);

      printSuccess("Database schema initialized");

      if (client.giveawayManager) {
        await client.giveawayManager.init();
        printSuccess("Giveaway system initialized");
      }

      printBotReady(client.user.tag);

      let servers = client.guilds.cache.size;
      let users = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);

      printInfo(`${servers} servers • ${formatNumber(users)} users • ${client.commands.size} commands`);

      printSystemReady();

      let status = [
        { name: `AeroX | Premium Features`, type: ActivityType.Playing },
        { name: `/help | AeroX`, type: ActivityType.Listening },
        { name: `/help | ${client.commands.size} Commands`, type: ActivityType.Listening },
        { name: "AeroX <3", type: ActivityType.Playing },
        { name: `/help | in ${servers} Servers`, type: ActivityType.Playing },
        { name: `/help | with ${formatNumber(users)} Users`, type: ActivityType.Watching },
      ];

      setInterval(() => {
        let random = Math.floor(Math.random() * status.length);
        client.user.setActivity(status[random]);
      }, 15000);

    } catch (error) {
      console.error(`${Colors.RED}✗${Colors.RESET} Startup error: ${error.message}`);
    }

    function formatNumber(number) {
      if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + "M";
      } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + "K";
      } else {
        return number.toString();
      }
    }
  },
};

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
