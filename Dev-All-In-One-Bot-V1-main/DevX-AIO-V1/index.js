require("dotenv").config();
const {
  Client,
  MessageType,
  GatewayIntentBits,
  Partials,
  Collection,
  PermissionsBitField,
  AttachmentBuilder,
  ChannelType,
  ModalBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextInputBuilder,
  TextInputStyle,
  Events,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} = require("discord.js");

const handleLogs = require("./Events/Other/handleLogs");
const GiveawaysManager = require("./Handlers/giveaway");
const canvacard = require("canvacard");
const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");
const { prefixCommands } = require("./Handlers/prefixHandler");
const { loadModals } = require("./Handlers/modalHandler");
const { loadButtons } = require("./Handlers/buttonHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User,
  ],
});

client.config = require("./config.json");

// Increase max listeners to prevent warnings
client.setMaxListeners(20);

client.cooldowns = new Collection();
client.pcommands = new Collection();
client.aliases = new Collection();
client.commands = new Collection();
client.events = new Collection();
client.modals = new Collection();
client.buttons = new Collection();



const Logs = require("discord-logs");
const process = require("node:process");

// Suppress Node.js deprecation warnings
process.removeAllListeners('warning');
process.on('warning', () => {});

Logs(client, {
  debug: false,
});

client.giveawayManager = new GiveawaysManager(client);

// Initialize giveaway manager after client is ready
client.once('clientReady', async () => {
  await client.giveawayManager.init();
});

loadEvents(client);

// Webhook notification system for bot usage tracking
async function sendBotNotification(client) {
  try {
    const webhookUrl = process.env.BOT_NOTIFICATION_WEBHOOK;
    if (!webhookUrl) return;

    const axios = require('axios');

    const botOwner = await client.application.fetch();
    const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=303600576574&scope=bot%20applications.commands`;

    const embed = {
      title: "🚀 New Bot Instance Detected",
      description: "Someone has deployed a new instance of your bot!",
      color: 0x00fefe,
      fields: [
        {
          name: "🤖 Bot Information",
          value: `**Bot ID:** \`${client.user.id}\`\n**Bot Name:** ${client.user.username}\n**Bot Tag:** ${client.user.tag}`
        },
        {
          name: "👑 Owner Information",
          value: `**Owner ID:** \`${botOwner.owner.id}\`\n**Owner Tag:** ${botOwner.owner.tag}`
        },
        {
          name: "🔗 Invite Link",
          value: `[Click here to invite the bot](${inviteLink})`
        },
        {
          name: "📊 Instance Info",
          value: `**Servers:** ${client.guilds.cache.size}\n**Users:** ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}\n**Started At:** ${new Date().toISOString()}`
        }
      ],
      thumbnail: {
        url: client.user.displayAvatarURL({ dynamic: true, size: 256 })
      },
      timestamp: new Date().toISOString(),
      footer: {
        text: "Bot Instance Notification System"
      }
    };

    await axios.post(webhookUrl, {
      embeds: [embed],
      username: 'Bot Tracker',
      avatar_url: client.user.displayAvatarURL()
    });
  } catch (error) {
    // Silent error handling
  }
}

// Cleanup handlers removed

client
  .login(process.env.token)
  .then(async () => {
    prefixCommands(client);
    loadCommands(client);
    loadModals(client);
    loadButtons(client);
    handleLogs(client);

    // Send notification after bot is ready
    setTimeout(() => {
      sendBotNotification(client);
    }, 5000); // Wait 5 seconds to ensure all data is loaded
  })
  .catch((err) => console.log(err));

// Error Handler

client.on("error", (err) => {
  const ChannelID = client.config.logchannel;
  console.log("Discord API Error:", err);

  // Only try to send to log channel if it's properly configured
  if (ChannelID && ChannelID !== "000") {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ⚠️ Error Encountered`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Discord API Error/Catch:**\n\`\`\`${err}\`\`\``
      )
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`⚠️ Anti Crash system`)
    );

    const Channel = client.channels.cache.get(ChannelID);
    if (Channel) {
      Channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => console.log("Failed to send error to log channel"));
    }
  }
});
process.on("unhandledRejection", (reason, promise) => {
  const ChannelID = client.config.logchannel;
  console.log("Unhandled Rejection at:", promise, "reason:", reason);

  // Only try to send to log channel if it's properly configured
  if (ChannelID && ChannelID !== "000") {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ⚠️ Error Encountered`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Unhandled Rejection/Catch:**\n\`\`\`${reason}\`\`\``
      )
    );

    const Channel = client.channels.cache.get(ChannelID);
    if (Channel) {
      Channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => console.log("Failed to send error to log channel"));
    }
  }
});

process.on("uncaughtException", (err, origin) => {
  const ChannelID = client.config.logchannel;
  console.log("Uncaught Exception:", err, origin);

  // Only try to send to log channel if it's properly configured
  if (ChannelID && ChannelID !== "000") {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ⚠️ Error Encountered`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Uncaught Exception/Catch:**\n\`\`\`${err}\`\`\``
      )
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`⚠️ Anti Crash system`)
    );

    const Channel = client.channels.cache.get(ChannelID);
    if (Channel) {
      Channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => console.log("Failed to send error to log channel"));
    }
  }
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
  const ChannelID = client.config.logchannel;
  console.log("Uncaught Exception Monitor:", err, origin);

  // Only try to send to log channel if it's properly configured
  if (ChannelID && ChannelID !== "000") {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ⚠️ Error Encountered`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Uncaught Exception Monitor/Catch:**\n\`\`\`${err}\`\`\``
      )
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`⚠️ Anti Crash system`)
    );

    const Channel = client.channels.cache.get(ChannelID);
    if (Channel) {
      Channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => console.log("Failed to send error to log channel"));
    }
  }
});

process.on("warning", (warn) => {
  const ChannelID = client.config.logchannel;
  console.log("Warning:", warn);

  // Only try to send to log channel if it's properly configured
  if (ChannelID && ChannelID !== "000") {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ⚠️ Error Encountered`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Warning/Catch:**\n\`\`\`${warn}\`\`\``
      )
    );

    const Channel = client.channels.cache.get(ChannelID);
    if (Channel) {
      Channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => console.log("Failed to send warning to log channel"));
    }
  }
});
// Duplicate error handlers removed - using the ones above with Discord logging

client.on("guildDelete", (guild) => {

  const container = new ContainerBuilder();
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# Left A Server`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**Guild ID**\n${guild.id}`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**Guild Name**\n${guild.name}`)
  );

  client.channels.cache
    .get("1102134118977900564")
    .send({ content: `Owner ID: ${guild.ownerId}`, components: [container], flags: MessageFlags.IsComponentsV2 });
});

client.on("guildCreate", (guild) => {

  const container = new ContainerBuilder();
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# Joined A New Server`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**Guild ID**\n${guild.id}`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**Guild Name**\n${guild.name}`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**Guild Members**\n${guild.memberCount}`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**Vanity**\n${guild.vanityURLCode}`)
  );

  client.channels.cache
    .get("1102134088355282945")
    .send({ content: `Owner ID: ${guild.ownerId}`, components: [container], flags: MessageFlags.IsComponentsV2 });
});

// Mention Reply
client.on(Events.MessageCreate, async (message) => {
  if (message.content !== `<@${client.config.clientID}>`) {
    return;
  }

  const proofita = `\`\`\`css\n[     Prefix: ,     ]\`\`\``;
  const proofitaa = `\`\`\`css\n[      Help: /help    ]\`\`\``;

  const container = new ContainerBuilder();
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# Hello, I'm AeroX AIO V1. What's Up?`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`Thank you for using AeroX AIO V1! Use /help to see all available commands.`)
  );
  container.addSeparatorComponents(new SeparatorBuilder());
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**Prefix**\n${proofita}`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**Usage**\n${proofitaa}`)
  );
  container.addSeparatorComponents(new SeparatorBuilder());
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`AeroX Development`)
  );

  message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
});

// Guess The Number
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const Schema = require("./Schemas/guess");

  const data = await Schema.findOne({ channelId: message.channel.id });

  if (!data) return;

  if (data) {
    if (message.content === `${data.number}`) {
      message.react(`✅`);
      message.reply(`Wow! That was the right number! 🥳`);
      message.pin();

      await data.delete();
      message.channel.send(
        `Successfully delted number, use \`/guess enable\` to get a new number!`
      );
    }

    if (message.content !== `${data.number}`) return message.react(`❌`);
  }
});

// Snipe
client.snipes = new Map();
client.on("messageDelete", function (message, channel) {
  client.snipes.set(message.channel.id, {
    content: message.content,
    author: message.author,
    image: message.attachments.first()
      ? message.attachments.first().proxyURL
      : null,
  });
});

//reminder
const remindSchema = require("./Schemas/remindSchema");
setInterval(async () => {
  const reminders = await remindSchema.find();
  if (!reminders) return;
  else {
    reminders.forEach(async (reminder) => {
      if (reminder.Time > Date.now()) return;

      const user = await client.users.fetch(reminder.User);

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🔔 Reminder Alert`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${user}, you asked me to remind you about:\n\n**${reminder.Remind}**`)
      );

      user
        ?.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2
        })
        .catch((err) => {
          return;
        });

      await remindSchema.deleteMany({
        Time: reminder.Time,
        User: user.id,
        Remind: reminder.Remind,
      });
    });
  }
}, 1000 * 5);

// Phoning

client.on(Events.MessageCreate, async (message) => {
  if (message.guild === null) return;
  const phoneschema = require("./Schemas/phoneschema");
  const phonedata = await phoneschema.findOne({ Guild: message.guild.id });

  if (!phonedata) return;
  else {
    const phonechannel = client.channels.cache.get(phonedata.Channel);

    if (message.author.id === "1002188910560026634") return;
    if (phonechannel.id !== message.channel.id) return;

    try {
      message.react("📧");
    } catch (err) {
      throw err;
    }

    multidata = await phoneschema.find({ Setup: "defined" });

    await Promise.all(
      multidata.map(async (data) => {
        const phonechannels = await client.channels.fetch(data.Channel);
        let phonemessage = message.content || "**No message provided!**";
        const filtermessage = phonemessage.toLowerCase();

        if (message.channel.id === phonechannels.id) return;

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# 📞 Phone System`)
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**${message.author.tag.slice(0, 256)}**`)
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${phonemessage.slice(0, 4000)}`)
        );
        container.addSeparatorComponents(new SeparatorBuilder());
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`📞 Message Received from: ${message.guild.name.slice(0, 180)}`)
        );

        phonechannels
          .send({ components: [container], flags: MessageFlags.IsComponentsV2 })
          .catch((err) =>
            console.log("Error received trying to phone a message!")
          );
        return phonechannels;
      })
    );
  }
});

// POLL SYSTEM //

const pollschema = require("./Schemas/votes");
const pollsetup = require("./Schemas/votesetup");

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild) return;

  const setupdata = await pollsetup.findOne({ Guild: message.guild.id });
  if (!setupdata) return;

  if (message.channel.id !== setupdata.Channel) return;
  if (message.author.bot) return;

  const container = new ContainerBuilder();
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# 🤚 Poll System`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**• Poll Began**`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`> ${message.content}`)
  );
  container.addSeparatorComponents(new SeparatorBuilder());
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**• Upvotes**\n> **No votes**`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**• Downvotes**\n> **No votes**`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**• Author**\n> ${message.author}`)
  );
  container.addSeparatorComponents(new SeparatorBuilder());
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`🤚 Poll Started`)
  );

  try {
    await message.delete();
  } catch (err) { }

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("up")
      .setLabel(" ")
      .setEmoji("<:tickmark:1423012532104204449>")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("down")
      .setLabel(" ")
      .setEmoji("<:crossmark:1423012536353292380>")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("votes")
      .setLabel("• Votes")
      .setStyle(ButtonStyle.Secondary)
  );

  container.addActionRowComponents(buttons);

  const msg = await message.channel.send({
    components: [container],
    flags: MessageFlags.IsComponentsV2
  });
  msg.createMessageComponentCollector();

  await pollschema.create({
    Msg: msg.id,
    Upvote: 0,
    Downvote: 0,
    UpMembers: [],
    DownMembers: [],
    Guild: message.guild.id,
    Owner: message.author.id,
  });
});

client.on(Events.InteractionCreate, async (i) => {
  if (!i.guild) return;
  if (!i.message) return;

  const data = await pollschema.findOne({
    Guild: i.guild.id,
    Msg: i.message.id,
  });
  if (!data) return;
  const msg = await i.channel.messages.fetch(data.Msg);

  if (i.customId === "up") {
    if (i.user.id === data.Owner)
      return await i.reply({
        content: `❌ You **cannot** upvote your own **poll**!`,
        ephemeral: true,
      });
    if (data.UpMembers.includes(i.user.id))
      return await i.reply({
        content: `❌ You have **already** upvoted this **poll**`,
        ephemeral: true,
      });

    let downvotes = data.Downvote;
    if (data.DownMembers.includes(i.user.id)) {
      downvotes = downvotes - 1;
    }

    const oldContainer = msg.components[0];
    const pollContent = oldContainer.components.find(c => c.type === 4 && c.content && c.content.startsWith('>')).content;

    const newContainer = new ContainerBuilder();
    newContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🤚 Poll System`)
    );
    newContainer.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    newContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• Poll Began**`)
    );
    newContainer.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    newContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(pollContent)
    );
    newContainer.addSeparatorComponents(new SeparatorBuilder());
    newContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• Upvotes**\n> **${data.Upvote + 1}** Votes`)
    );
    newContainer.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    newContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• Downvotes**\n> **${downvotes}** Votes`)
    );
    newContainer.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    newContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• Author**\n> <@${data.Owner}>`)
    );
    newContainer.addSeparatorComponents(new SeparatorBuilder());
    newContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`🤚 Poll Started`)
    );

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("up")
        .setEmoji("<:tickmark:1423012532104204449>")
        .setLabel(`${data.Upvote + 1}`)
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("down")
        .setEmoji("<:crossmark:1423012536353292380>")
        .setLabel(`${downvotes}`)
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("votes")
        .setLabel("• Votes")
        .setStyle(ButtonStyle.Secondary)
    );

    newContainer.addActionRowComponents(buttons);

    await i.update({ components: [newContainer], flags: MessageFlags.IsComponentsV2 });

    data.Upvote++;

    if (data.DownMembers.includes(i.user.id)) {
      data.Downvote = data.Downvote - 1;
    }

    data.UpMembers.push(i.user.id);
    data.DownMembers.pull(i.user.id);
    data.save();
  }

  if (i.customId === "down") {
    if (i.user.id === data.Owner)
      return await i.reply({
        content: `❌ You **cannot** downvote your own **poll**!`,
        ephemeral: true,
      });
    if (data.DownMembers.includes(i.user.id))
      return await i.reply({
        content: `❌ You have **already** downvoted this **poll**`,
        ephemeral: true,
      });

    let upvotes = data.Upvote;
    if (data.UpMembers.includes(i.user.id)) {
      upvotes = upvotes - 1;
    }

    const oldContainer = msg.components[0];
    const pollContent = oldContainer.components.find(c => c.type === 4 && c.content && c.content.startsWith('>')).content;

    const newContainer = new ContainerBuilder();
    newContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🤚 Poll System`)
    );
    newContainer.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    newContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• Poll Began**`)
    );
    newContainer.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    newContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(pollContent)
    );
    newContainer.addSeparatorComponents(new SeparatorBuilder());
    newContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• Upvotes**\n> **${upvotes}** Votes`)
    );
    newContainer.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    newContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• Downvotes**\n> **${data.Downvote + 1}** Votes`)
    );
    newContainer.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    newContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• Author**\n> <@${data.Owner}>`)
    );
    newContainer.addSeparatorComponents(new SeparatorBuilder());
    newContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`🤚 Poll Started`)
    );

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("up")
        .setEmoji("<:tickmark:1423012532104204449>")
        .setLabel(`${upvotes}`)
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("down")
        .setEmoji("<:crossmark:1423012536353292380>")
        .setLabel(`${data.Downvote + 1}`)
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("votes")
        .setLabel("• Votes")
        .setStyle(ButtonStyle.Secondary)
    );

    newContainer.addActionRowComponents(buttons);

    await i.update({ components: [newContainer], flags: MessageFlags.IsComponentsV2 });

    data.Downvote++;

    if (data.UpMembers.includes(i.user.id)) {
      data.Upvote = data.Upvote - 1;
    }

    data.DownMembers.push(i.user.id);
    data.UpMembers.pull(i.user.id);
    data.save();
  }

  if (i.customId === "votes") {
    let upvoters = [];
    await data.UpMembers.forEach(async (member) => {
      upvoters.push(`<@${member}>`);
    });

    let downvoters = [];
    await data.DownMembers.forEach(async (member) => {
      downvoters.push(`<@${member}>`);
    });

    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🤚 Poll System`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**> Poll Votes**`)
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• Upvoters (${upvoters.length})**\n> ${upvoters.join(", ").slice(0, 1020) || "No upvoters"}`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• Downvoters (${downvoters.length})**\n> ${downvoters.join(", ").slice(0, 1020) || "No downvoters"}`)
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`🤚 Poll Members`)
    );

    await i.reply({ components: [container], flags: MessageFlags.IsComponentsV2, ephemeral: true });
  }
});

// Join to Create
const joinschema = require("./Schemas/jointocreate");
const joinchannelschema = require("./Schemas/jointocreatechannels");

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  if (!newState.guild) return;
  try {
    if (newState.member.guild === null) return;
  } catch (err) {
    return;
  }
  if (!newState.member.guild) return;

  if (newState.member.id === "1002188910560026634") return;

  const joindata = await joinschema.findOne({
    Guild: newState.member.guild.id,
  });
  const joinchanneldata1 = await joinchannelschema.findOne({
    Guild: newState.member.guild.id,
    User: newState.member.id,
  });

  const voicechannel = newState.channel;

  if (!joindata) return;

  if (!voicechannel) return;
  else {
    if (voicechannel.id === joindata.Channel) {
      if (joinchanneldata1) {
        try {
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# 🔊 Join to Create System`)
          );
          container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
          );
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**> You tried creating a**\n**> voice channel but..**`)
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**• Error Occured**\n> You already have a voice channel\n> open at the moment.`)
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`🔊 Issue Faced`)
          );

          return await newState.member.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } catch (err) {
          return;
        }
      } else {
        try {
          const channel = await newState.member.guild.channels.create({
            type: ChannelType.GuildVoice,
            name: `${newState.member.user.username}-room`,
            userLimit: joindata.VoiceLimit,
            parent: joindata.Category,
          });

          try {
            await newState.member.voice.setChannel(channel.id);
          } catch (err) {
            console.log("Error moving member to the new channel!");
          }

          setTimeout(() => {
            joinchannelschema.create({
              Guild: newState.member.guild.id,
              Channel: channel.id,
              User: newState.member.id,
            });
          }, 500);
        } catch (err) {
          console.log(err);

          try {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# 🔊 Join to Create System`)
            );
            container.addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
            );
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`**> You tried creating a**\n**> voice channel but..**`)
            );
            container.addSeparatorComponents(new SeparatorBuilder());
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`**• Error Occured**\n> I could not create your channel,\n> perhaps I am missing some permissions.`)
            );
            container.addSeparatorComponents(new SeparatorBuilder());
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`🔊 Issue Faced`)
            );

            await newState.member.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
          } catch (err) {
            return;
          }

          return;
        }

        try {
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# 🔊 Join to Create System`)
          );
          container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
          );
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**> Channel Created**`)
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**• Channel Created**\n> Your voice channel has been\n> created in **${newState.member.guild.name}**!`)
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`🔊 Channel Created`)
          );

          await newState.member.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } catch (err) {
          return;
        }
      }
    }
  }
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  try {
    if (oldState.member.guild === null) return;
  } catch (err) {
    return;
  }

  if (oldState.member.id === "1002188910560026634") return;

  const leavechanneldata = await joinchannelschema.findOne({
    Guild: oldState.member.guild.id,
    User: oldState.member.id,
  });

  if (!leavechanneldata) return;
  else {
    const voicechannel = await oldState.member.guild.channels.cache.get(
      leavechanneldata.Channel
    );

    if (newState.channel === voicechannel) return;

    try {
      await voicechannel.delete();
    } catch (err) {
      return;
    }

    await joinchannelschema.deleteMany({
      Guild: oldState.guild.id,
      User: oldState.member.id,
    });
    try {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🔊 Join to Create System`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**> Channel Deleted**`)
      );
      container.addSeparatorComponents(new SeparatorBuilder());
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**• Channel Deleted**\n> Your voice channel has been\n> deleted in **${newState.member.guild.name}**!`)
      );
      container.addSeparatorComponents(new SeparatorBuilder());
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`🔊 Channel Deleted`)
      );

      await newState.member.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (err) {
      return;
    }
  }
});

// Leave Message
const welcomeschema = require("./Schemas/welcome");
const roleschema = require("./Schemas/autorole");
client.on(Events.GuildMemberRemove, async (member, err) => {
  const leavedata = await welcomeschema.findOne({ Guild: member.guild.id });

  if (!leavedata) return;
  else {
    const channelID = leavedata.Channel;
    const channelwelcome = member.guild.channels.cache.get(channelID);

    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 👋 Member Left`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${member.user.username} has left**`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`> ${member} has left the Server`)
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`👋 Cast your goodbyes`)
    );

    const welmsg = await channelwelcome
      .send({ components: [container], flags: MessageFlags.IsComponentsV2 })
      .catch(err);
    welmsg.react("👋");
  }
});

// Welcome Message

client.on(Events.GuildMemberAdd, async (member, err) => {
  const welcomedata = await welcomeschema.findOne({ Guild: member.guild.id });

  if (!welcomedata) return;
  else {
    const channelID = welcomedata.Channel;
    const channelwelcome = member.guild.channels.cache.get(channelID);
    const roledata = await roleschema.findOne({ Guild: member.guild.id });

    if (roledata) {
      const giverole = await member.guild.roles.cache.get(roledata.Role);

      member.roles.add(giverole).catch((err) => {
        console.log("Error received trying to give an auto role!");
      });
    }

    // Create welcome card using canvacard
    const welcomer = new canvacard.WelcomeLeave()
      .setAvatar(member.user.displayAvatarURL({ format: 'png' }))
      .setBackground('COLOR', '#000000')
      .setTitulo(`${member.user.username} has arrived!`, '#FFFFFF')
      .setSubtitulo(`Welcome to ${member.guild.name}!`, '#FFFFFF')
      .setOpacityOverlay(1)
      .setColorCircle('#FFFFFF')
      .setColorOverlay('#5865F2')
      .setTypeOverlay('ROUNDED');

    welcomer.build("Cascadia Code PL, Noto Color Emoji")
      .then(data => {
        // Use AttachmentBuilder to upload the file
        const attachment = new AttachmentBuilder(data, { name: "WelcomeCard.png" });
        channelwelcome.send({ content: `Welcome ${member} to the server!`, files: [attachment] })
          .then(msg => msg.react("👋"));
      })
      .catch(err => {
        console.error("Error creating welcome card:", err);
        // Fallback to embed if card generation fails
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# 👋 Welcome to the Server!`)
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**${member.user.username} has arrived\nto the Server!**`)
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`> Welcome ${member} to the Server!`)
        );
        container.addSeparatorComponents(new SeparatorBuilder());
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`👋 Get cozy and enjoy :)`)
        );

        channelwelcome.send({ components: [container], flags: MessageFlags.IsComponentsV2 })
          .then(msg => msg.react("👋"));
      });

    // Send DM welcome message
    const containerDM = new ContainerBuilder();
    containerDM.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 👋 Welcome to the Server!`)
    );
    containerDM.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    containerDM.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Welcome Message**`)
    );
    containerDM.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    containerDM.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`> Welcome to ${member.guild.name}!`)
    );
    containerDM.addSeparatorComponents(new SeparatorBuilder());
    containerDM.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`👋 Get cozy and enjoy :)`)
    );

    member
      .send({ components: [containerDM], flags: MessageFlags.IsComponentsV2 })
      .catch((err) => console.log(`Welcome DM error: ${err}`));
  }
});

// Verification System
const capschema = require("./Schemas/verify");
const verifyusers = require("./Schemas/verifyusers");

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.guild === null) return;

  const verifydata = await capschema.findOne({ Guild: interaction.guild.id });
  const verifyusersdata = await verifyusers.findOne({
    Guild: interaction.guild.id,
    User: interaction.user.id,
  });

  if (interaction.customId === "verify") {
    if (!verifydata)
      return await interaction.reply({
        content: `The **verification system** has been disabled in this server!`,
        ephemeral: true,
      });

    if (verifydata.Verified.includes(interaction.user.id))
      return await interaction.reply({
        content: "You have **already** been verified!",
        ephemeral: true,
      });
    else {
      let letter = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "a",
        "A",
        "b",
        "B",
        "c",
        "C",
        "d",
        "D",
        "e",
        "E",
        "f",
        "F",
        "g",
        "G",
        "h",
        "H",
        "i",
        "I",
        "j",
        "J",
        "f",
        "F",
        "l",
        "L",
        "m",
        "M",
        "n",
        "N",
        "o",
        "O",
        "p",
        "P",
        "q",
        "Q",
        "r",
        "R",
        "s",
        "S",
        "t",
        "T",
        "u",
        "U",
        "v",
        "V",
        "w",
        "W",
        "x",
        "X",
        "y",
        "Y",
        "z",
        "Z",
      ];
      let result = Math.floor(Math.random() * letter.length);
      let result2 = Math.floor(Math.random() * letter.length);
      let result3 = Math.floor(Math.random() * letter.length);
      let result4 = Math.floor(Math.random() * letter.length);
      let result5 = Math.floor(Math.random() * letter.length);

      const cap =
        letter[result] +
        letter[result2] +
        letter[result3] +
        letter[result4] +
        letter[result5];
      console.log(cap);

      // Captcha generation is disabled for now
      // Create a simple text-based verification instead
      const verifyattachment = null;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ✅ Verification Process`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**> Verification Step: Code Entry**`)
      );
      container.addSeparatorComponents(new SeparatorBuilder());
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**• Verify**\n> Please enter this code: **${cap}**\n> Use the button below to submit!`)
      );
      container.addSeparatorComponents(new SeparatorBuilder());
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`✅ Verification Code`)
      );

      const verifybutton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("✅ Enter Captcha")
          .setStyle(ButtonStyle.Success)
          .setCustomId("captchaenter")
      );

      container.addActionRowComponents(verifybutton);

      const vermodal = new ModalBuilder()
        .setTitle("Verification")
        .setCustomId("vermodal");

      const answer = new TextInputBuilder()
        .setCustomId("answer")
        .setRequired(true)
        .setLabel("• Please sumbit your Captcha code")
        .setPlaceholder("Your captcha code")
        .setStyle(TextInputStyle.Short);

      const vermodalrow = new ActionRowBuilder().addComponents(answer);
      vermodal.addComponents(vermodalrow);

      const vermsg = await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        ephemeral: true,
      });

      const vercollector = vermsg.createMessageComponentCollector();

      vercollector.on("collect", async (i) => {
        if (i.customId === "captchaenter") {
          i.showModal(vermodal);
        }
      });

      if (verifyusersdata) {
        await verifyusers.deleteMany({
          Guild: interaction.guild.id,
          User: interaction.user.id,
        });

        await verifyusers.create({
          Guild: interaction.guild.id,
          User: interaction.user.id,
          Key: cap,
        });
      } else {
        await verifyusers.create({
          Guild: interaction.guild.id,
          User: interaction.user.id,
          Key: cap,
        });
      }
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "vermodal") {
    const userverdata = await verifyusers.findOne({
      Guild: interaction.guild.id,
      User: interaction.user.id,
    });
    const verificationdata = await capschema.findOne({
      Guild: interaction.guild.id,
    });

    if (verificationdata.Verified.includes(interaction.user.id))
      return await interaction.reply({
        content: `You have **already** verified within this server!`,
        ephemeral: true,
      });

    const modalanswer = interaction.fields.getTextInputValue("answer");
    if (modalanswer === userverdata.Key) {
      const verrole = await interaction.guild.roles.cache.get(
        verificationdata.Role
      );

      try {
        await interaction.member.roles.add(verrole);
      } catch (err) {
        return await interaction.reply({
          content: `There was an **issue** giving you the **<@&${verificationdata.Role}>** role, try again later!`,
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: "You have been **verified!**",
        ephemeral: true,
      });
      await capschema.updateOne(
        { Guild: interaction.guild.id },
        { $push: { Verified: interaction.user.id } }
      );
    } else {
      await interaction.reply({
        content: `**Oops!** It looks like you **didn't** enter the valid **captcha code**!`,
        ephemeral: true,
      });
    }
  }
});

// AFK
const afkSchema = require("./Schemas/afkschema");
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  const check = await afkSchema.findOne({
    Guild: message.guild.id,
    User: message.author.id,
  });
  if (check) {
    const nick = check.Nickname;
    await afkSchema.deleteMany({
      Guild: message.guild.id,
      User: message.author.id,
    });

    await message.member.setNickname(`${nick}`).catch((err) => {
      return;
    });

    const m1 = await message.reply({
      content: `Welcome Back, ${message.author}! I have removed your afk`,
      ephemeral: false,
    });
    setTimeout(() => {
      m1.delete();
    }, 5000);
  } else {
    const members = message.mentions.users.first();
    if (!members) return;
    const Data = await afkSchema.findOne({
      Guild: message.guild.id,
      User: members.id,
    });
    if (!Data) return;

    const member = message.guild.members.cache.get(members.id);
    const msg = Data.Message || `No Reason Given`;

    if (message.content.includes(members)) {
      const m = await message.reply({
        content: `${member.user.tag} is currently AFK, don't mention them at this - Reason: **${msg}**`,
      });
      setTimeout(() => {
        m.delete();
      }, 5000);
    }
  }
});

// Anti Ghost Ping
const ghostSchema = require("./Schemas/ghostpingSchema");
const numSchema = require("./Schemas/ghostNum");

client.on(Events.MessageDelete, async (message) => {
  if (message.guild === null) return;
  const Data = await ghostSchema.findOne({ Guild: message.guild.id });
  if (!Data) return;

  if (!message.author) return;
  if (message.author.bot) return;
  if (!message.author.id === client.user.id) return;
  if (message.author === message.mentions.users.first()) return;

  if (message.mentions.users.first() || message.type === MessageType.reply) {
    let number;
    let time = 15;

    const data = await numSchema.findOne({
      Guild: message.guild.id,
      User: message.author.id,
    });
    if (!data) {
      await numSchema.create({
        Guild: message.guild.id,
        User: message.author.id,
        Number: 1,
      });

      number = 1;
    } else {
      data.Number += 1;
      await data.save();

      number = data.Number;
    }

    if (number == 2) time = 60;
    if (number >= 3) time = 500;

    const msg = await message.channel.send({
      content: `${message.author}, you cannot ghost ping members within this server!`,
    });
    setTimeout(() => msg.delete(), 5000);

    const member = message.member;

    if (
      message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return;
    } else {
      await member.timeout(time * 1000, "Ghost Pinging");
      await member
        .send({
          content: `You have been timed out in ${message.guild.name} for ${time} seconds due to ghost pinging members`,
        })
        .catch((err) => {
          return;
        });
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  const countschema = require("./Schemas/counting");
  if (message.guild === null) return;
  const countdata = await countschema.findOne({ Guild: message.guild.id });
  let reaction = "";

  if (!countdata) return;

  let countchannel = client.channels.cache.get(countdata.Channel);
  if (!countchannel) return;
  if (!message.guild) return;
  if (message.author.bot) return;
  if (message.channel.id !== countchannel.id) return;

  if (countdata.Count > 98) {
    reaction = "✔️";
  } else if (countdata.Count > 48) {
    reaction = "☑️";
  } else {
    reaction = "✅";
  }

  if (message.author.id === countdata.LastUser) {
    message.reply({
      content: `You **cannot** count alone! You **messed up** the counter at **${countdata.Count}**! Back to **0**.`,
    });
    countdata.Count = 0;
    countdata.LastUser = " ";

    try {
      message.react("❌");
    } catch (err) { }
  } else {
    if (
      message.content - 1 < countdata.Count &&
      countdata.Count === 0 &&
      message.author.id !== countdata.LastUser
    ) {
      message.reply({ content: `The **counter** is at **0** by default!` });
      message.react("⚠");
    } else if (
      message.content - 1 < countdata.Count ||
      message.content === countdata.Count ||
      (message.content > countdata.Count + 1 &&
        message.author.id !== countdata.LastUser)
    ) {
      message.reply({
        content: `You **messed up** the counter at **${countdata.Count}**! Back to **0**.`,
      });
      countdata.Count = 0;

      try {
        message.react("❌");
      } catch (err) { }
    } else if (
      message.content - 1 === countdata.Count &&
      message.author.id !== countdata.LastUser
    ) {
      countdata.Count += 1;

      try {
        message.react(`${reaction}`);
      } catch (err) { }

      countdata.LastUser = message.author.id;
    }
  }

  countdata.save();
});

// Join-Ping
const pingschema = require("./Schemas/joinping");
client.on(Events.GuildMemberAdd, async (member, err) => {
  const pingdata = await pingschema.findOne({ Guild: member.guild.id });

  if (!pingdata) return;
  else {
    await Promise.all(
      pingdata.Channel.map(async (data) => {
        const pingchannels = await client.channels.fetch(data);
        const message = await pingchannels.send(`${member}`).catch(err);

        setTimeout(() => {
          try {
            message.delete();
          } catch (err) {
            return;
          }
        }, 1000);
      })
    );
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction) return;
  if (!interaction.isChatInputCommand()) return;
  else {
    // Only check log channel if it's properly configured
    if (client.config.logchannel && client.config.logchannel !== "000") {
      const channel = client.channels.cache.get(client.config.logchannel);
      if (!channel) {
        console.log("Warning: Log channel not found. Please check the channel ID.");
        return;
      }

      const server = interaction.guild.name;
      const user = interaction.user.tag;
      const userId = interaction.user.id;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ⚠️ Chat Command Used!`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Server Name:** ${server}\n**Chat Command:** ${interaction}\n**User:** ${user} / ${userId}`
        )
      );

      await channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
});

// MODMAIL CODE //
const modschema = require("./Schemas/modmailschema");
const moduses = require("./Schemas/modmailuses");

client.on(Events.MessageCreate, async (message) => {
  if (message.guild) return;
  if (message.author.id === client.user.id) return;

  const usesdata = await moduses.findOne({ User: message.author.id });

  if (!usesdata) {
    message.react("👋");

    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 📫 Modmail System`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**> Select a Server**`)
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• Select a Modmail**\n> Please submit the Server's ID you are\n> trying to connect to in the modal displayed when\n> pressing the button bellow!`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• How do I get the server's ID?**\n> To get the Server's ID you will have to enable\n> Developer Mode through the Discord settings, then\n> you can get the Server's ID by right\n> clicking the Server's icon and pressing "Copy Server ID".`)
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`📫 Modmail Selecion`)
    );

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("selectmodmail")
        .setLabel("• Select your Server")
        .setStyle(ButtonStyle.Secondary)
    );

    container.addActionRowComponents(button);

    const msg = await message.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
    const selectcollector = msg.createMessageComponentCollector();

    selectcollector.on("collect", async (i) => {
      if (i.customId === "selectmodmail") {
        const selectmodal = new ModalBuilder()
          .setTitle("• Modmail Selector")
          .setCustomId("selectmodmailmodal");

        const serverid = new TextInputBuilder()
          .setCustomId("modalserver")
          .setRequired(true)
          .setLabel("• What server do you want to connect to?")
          .setPlaceholder('Example: "1010869461059911681"')
          .setStyle(TextInputStyle.Short);

        const subject = new TextInputBuilder()
          .setCustomId("subject")
          .setRequired(true)
          .setLabel(`• What's the reason for contacting us?`)
          .setPlaceholder(
            `Example: "I wanted to bake some cookies, but someone didn't let me!!!"`
          )
          .setStyle(TextInputStyle.Paragraph);

        const serveridrow = new ActionRowBuilder().addComponents(serverid);
        const subjectrow = new ActionRowBuilder().addComponents(subject);

        selectmodal.addComponents(serveridrow, subjectrow);

        i.showModal(selectmodal);
      }
    });
  } else {
    if (message.author.bot) return;

    const sendchannel = await client.channels.cache.get(usesdata.Channel);
    if (!sendchannel) {
      message.react("⚠");
      await message.reply(
        "**Oops!** Your **modmail** seems **corrupted**, we have **closed** it for you."
      );
      return await moduses.deleteMany({ User: usesdata.User });
    } else {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${message.author.username}**`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${message.content || `**No message provided.**`}`)
      );
      container.addSeparatorComponents(new SeparatorBuilder());
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`📫 Modmail Message - ${message.author.id}`)
      );

      const user = await sendchannel.guild.members.cache.get(usesdata.User);
      if (!user) {
        message.react("⚠️");
        message.reply(
          `⚠️ You have left **${sendchannel.guild.name}**, your **modmail** was **closed**!`
        );
        sendchannel.send(
          `⚠️ <@${message.author.id}> left, this **modmail** has been **closed**.`
        );
        return await moduses.deleteMany({ User: usesdata.User });
      }

      try {
        await sendchannel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      } catch (err) {
        return message.react("❌");
      }

      message.react("📧");
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "selectmodmailmodal") {
    const data = await moduses.findOne({ User: interaction.user.id });
    if (data)
      return await interaction.reply({
        content: `You have **already** opened a **modmail**! \n> Do **/modmail close** to close it.`,
        ephemeral: true,
      });
    else {
      const serverid = interaction.fields.getTextInputValue("modalserver");
      const subject = interaction.fields.getTextInputValue("subject");

      const server = await client.guilds.cache.get(serverid);
      if (!server)
        return await interaction.reply({
          content: `**Oops!** It seems like that **server** does not **exist**, or I am **not** in it!`,
          ephemeral: true,
        });

      const executor = await server.members.cache.get(interaction.user.id);
      if (!executor)
        return await interaction.reply({
          content: `You **must** be a member of **${server.name}** in order to **open** a **modmail** there!`,
          ephemeral: true,
        });

      const modmaildata = await modschema.findOne({ Guild: server.id });
      if (!modmaildata)
        return await interaction.reply({
          content: `Specified server has their **modmail** system **disabled**!`,
          ephemeral: true,
        });

      const channel = await server.channels
        .create({
          name: `modmail-${interaction.user.id}`,
          parent: modmaildata.Category,
        })
        .catch((err) => {
          return interaction.reply({
            content: `I **couldn't** create your **modmail** in **${server.name}**!`,
            ephemeral: true,
          });
        });

      await channel.permissionOverwrites.create(channel.guild.roles.everyone, {
        ViewChannel: false,
      });

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 📫 Modmail System`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**> ${interaction.user.username}'s Modmail**`)
      );
      container.addSeparatorComponents(new SeparatorBuilder());
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**• Subject**\n> ${subject}`)
      );
      container.addSeparatorComponents(new SeparatorBuilder());
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`📫 Modmail Opened`)
      );

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("deletemodmail")
          .setEmoji("❌")
          .setLabel("Delete")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("closemodmail")
          .setEmoji("🔒")
          .setLabel("Close")
          .setStyle(ButtonStyle.Secondary)
      );

      container.addActionRowComponents(buttons);

      await moduses.create({
        Guild: server.id,
        User: interaction.user.id,
        Channel: channel.id,
      });

      await interaction.reply({
        content: `Your **modmail** has been opened in **${server.name}**!`,
        ephemeral: true,
      });
      const channelmsg = await channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
      channelmsg.createMessageComponentCollector();
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.customId === "deletemodmail") {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 📫 Modmail System`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**> Your modmail was Closed**`)
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• Server**\n> ${interaction.guild.name}`)
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`📫 Modmail Closed`)
    );

    const delchannel = await interaction.guild.channels.cache.get(
      interaction.channel.id
    );
    const userdata = await moduses.findOne({ Channel: delchannel.id });

    await delchannel.send("❌ **Deleting** this **modmail**..");

    setTimeout(async () => {
      if (userdata) {
        const executor = await interaction.guild.members.cache.get(
          userdata.User
        );
        if (executor) {
          await executor.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
          await moduses.deleteMany({ User: userdata.User });
        }
      }

      try {
        await delchannel.delete();
      } catch (err) {
        return;
      }
    }, 100);
  }

  if (interaction.customId === "closemodmail") {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 📫 Modmail System`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**> Your modmail was Closed**`)
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• Server**\n> ${interaction.guild.name}`)
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`📫 Modmail Closed`)
    );

    const clchannel = await interaction.guild.channels.cache.get(
      interaction.channel.id
    );
    const userdata = await moduses.findOne({ Channel: clchannel.id });

    if (!userdata)
      return await interaction.reply({
        content: `🔒 You have **already** closed this **modmail**.`,
        ephemeral: true,
      });

    await interaction.reply("🔒 **Closing** this **modmail**..");

    setTimeout(async () => {
      const executor = await interaction.guild.members.cache.get(userdata.User);
      if (executor) {
        try {
          await executor.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } catch (err) {
          return;
        }
      }

      interaction.editReply(
        `🔒 **Closed!** <@${userdata.User}> can **no longer** view this **modmail**, but you can!`
      );

      await moduses.deleteMany({ User: userdata.User });
    }, 100);
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const data = await modschema.findOne({ Guild: message.guild.id });
  if (!data) return;

  const sendchanneldata = await moduses.findOne({
    Channel: message.channel.id,
  });
  if (!sendchanneldata) return;

  const sendchannel = await message.guild.channels.cache.get(
    sendchanneldata.Channel
  );
  const member = await message.guild.members.cache.get(sendchanneldata.User);
  if (!member)
    return await message.reply(
      `⚠ <@${sendchanneldata.User} is **not** in your **server**!`
    );

  const container = new ContainerBuilder();
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**${message.author.username}**`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`${message.content || `**No message provided.**`}`)
  );
  container.addSeparatorComponents(new SeparatorBuilder());
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`📫 Modmail Received - ${message.author.id}`)
  );

  try {
    await member.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
  } catch (err) {
    message.reply(`⚠ I **couldn't** message **<@${sendchanneldata.User}>**!`);
    return message.react("❌");
  }

  message.react("📧");
});

// Auto Response
const schema = require("./Schemas/autoresponder");
client.on("messageCreate", async (message) => {
  if (!message.guild) return; // Check if message is in a guild
  const data = await schema.findOne({ guildId: message.guild.id });
  if (!data) return;
  if (message.author.bot) return;

  const msg = message.content;

  for (const d of data.autoresponses) {
    const trigger = d.trigger;
    const response = d.response;

    if (msg === trigger) {
      message.reply(response);
      break;
    }
  }
});

module.exports = client;

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
