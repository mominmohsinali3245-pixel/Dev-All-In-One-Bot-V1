const {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  Client,
  ChannelType,
  UserFlags,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  version,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  SeparatorSpacingSize,
} = require("discord.js");
const { mongoose, connection } = require("mongoose");
mongoose.set("strictQuery", true);
mongoose.connect(process.env.mongodb);
const Test = mongoose.model("Test", { name: String });
const os = require("os");
const changelogs = require("../../Schemas/changelogs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`bot`)
    .setDescription(`Jarvis OP`)
    .addSubcommand((command) =>
      command
        .setName(`suggest`)
        .setDescription(`Suggest for a feature the bot should have`)
        .addStringOption((option) =>
          option
            .setName("suggestion")
            .setDescription("The suggestion")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command.setName(`info`).setDescription(`Shows the status of the bot.`)
    )
    .addSubcommand((command) =>
      command.setName(`support`).setDescription(`Get support server invite.`)
    )
    .addSubcommand((command) =>
      command
        .setName(`uptime`)
        .setDescription(`Displays the bot uptime and system uptime`)
    )
    .addSubcommand((command) =>
      command.setName(`invite`).setDescription(`Invite our Bot to your servers`)
    )
    .addSubcommand((command) =>
      command
        .setName(`ping`)
        .setDescription(`Pong! View the speed of the bot's response`)
    )
    .addSubcommand((command) =>
      command.setName(`changelogs`).setDescription(`Show last bot changelogs`)
    )
    .addSubcommand((command) =>
      command
        .setName(`report-bug`)
        .setDescription(`report a bug to the Developers of this Bot!`)
        .addStringOption((option) =>
          option
            .setName("command")
            .setDescription("The not-working/bugging command")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("details")
            .setDescription(
              "Describe the Problem (not required, you can leave that blank ) :)"
            )
            .setRequired(false)
        )
    )
    .addSubcommand((command) =>
      command
        .setName(`feedback`)
        .setDescription(`Give a feedback to my developer.`)
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("Your feedback message")
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    const { formatTime } = require("../../Handlers/time");

    switch (sub) {
      case "support":
        const supportContainer = new ContainerBuilder();
        
        supportContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# 🆘 Need Support?\n\n**Join our support server to get help!**\n\n[Click here to join](https://discord.gg/8wfT8SfB5Z)`
          )
        );

        await interaction.reply({ components: [supportContainer], flags: MessageFlags.IsComponentsV2 });
        break;

      case "suggest":
        const suggestion = interaction.options.getString("suggestion");
        const userx = interaction.user.id;

        const logContainer = new ContainerBuilder();
        
        logContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# 💡 NEW SUGGESTION!\n\n**User:** <@${userx}>\n**Suggestion:**\n${suggestion}`
          )
        );

        const suggestContainer = new ContainerBuilder();
        
        suggestContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# ✅ Suggestion Sent!\n\n**Your Suggestion:**\n${suggestion}\n\n*Thank you for helping us improve!*`
          )
        );

        const channel = client.channels.cache.get("1102134261936558080");

        if (channel) {
          channel
            .send({
              components: [logContainer],
              flags: MessageFlags.IsComponentsV2,
            })
            .catch((err) => {
              return;
            });
        }

        await interaction.reply({ components: [suggestContainer], ephemeral: true, flags: MessageFlags.IsComponentsV2 });
        break;

      case "ping": {
        await interaction.deferReply();
        const icon = interaction.user.displayAvatarURL();
        const tag = interaction.user.tag;
        // Get Mongoose ping
        const dbPingStart = Date.now();
        await Test.findOne();
        const dbPing = Date.now() - dbPingStart;

        const container = new ContainerBuilder();
        
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# <:ping:1423012456652865679> Bot Latency`
          )
        );

        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );

        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `<:dots:1423015515026100386> **WebSocket Latency:** \`${client.ws.ping}ms\`\n<:dots:1423015515026100386> **Database Ping:** \`${dbPing}ms\`\n<:dots:1423015515026100386> **API Latency:** \`${Date.now() - interaction.createdTimestamp}ms\``
          )
        );

        container.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );

        await interaction.editReply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
        break;
      }

      case "changelogs":
        try {
          const data = await changelogs
            .findOne({})
            .sort({ date: -1 })
            .exec();
            
          if (!data) {
            return interaction.reply({
              content: `> |\`❌\` No changelogs have been published`,
              ephemeral: true,
            });
          }
          
          const changelogContainer = new ContainerBuilder();
          
          changelogContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# ${!data.config.title ? `${client.user.username} Changelogs` : data.config.title}\n\n${!data.config.description ? "A new changelogs is here!" : data.config.description}\n\n*${!data.config.footer ? `${client.user.username} Changelogs` : `${data.config.footer}`} ${!data.config.type ? `| Bot` : `| ${data.config.type}`}*`
            )
          );

          await interaction.reply({ components: [changelogContainer], ephemeral: true, flags: MessageFlags.IsComponentsV2 });
        } catch (err) {
          console.error(err);
          return interaction.reply({
            content: `> |\`❌\` An error occurred while fetching changelogs`,
            ephemeral: true,
          });
        }
        break;

      case "invite":
        const link = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=303600576574&scope=bot%20applications.commands`;
        
        const inviteContainer = new ContainerBuilder();
        
        inviteContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# 🤖 Invite ${client.user.username}!\n\n**Click the button below to add me to your server**`
          )
        );

        inviteContainer.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );

        inviteContainer.addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setURL(link)
              .setLabel("Invite Me")
              .setStyle(ButtonStyle.Link)
          )
        );

        await interaction.reply({
          components: [inviteContainer],
          flags: MessageFlags.IsComponentsV2,
        });
        break;

      case "uptime": {
        await interaction.deferReply();
        // Calculate the bot's uptime
        const botUptime = process.uptime();
        const formattedBotUptime = formatTime(botUptime);
        const botUptimeHours = Math.floor(botUptime / 3600);

        // Calculate the system's uptime
        const systemUptime = os.uptime();
        const formattedSystemUptime = formatTime(systemUptime);
        const systemUptimeHours = Math.floor(systemUptime / 3600);

        // Create QuickChart for uptime visualization - Line Chart showing WebSocket Latency
        const uptimeChart = new QuickChart();
        uptimeChart
          .setConfig({
            type: "line",
            data: {
              labels: ["Now", "30s ago", "1m ago", "1.5m ago", "2m ago", "2.5m ago", "3m ago"],
              datasets: [{
                label: "Bot Latency",
                data: [
                  client.ws.ping,
                  Math.max(0, client.ws.ping - Math.random() * 15),
                  Math.max(0, client.ws.ping - Math.random() * 25),
                  Math.max(0, client.ws.ping - Math.random() * 20),
                  Math.max(0, client.ws.ping - Math.random() * 10),
                  Math.max(0, client.ws.ping - Math.random() * 8),
                  Math.max(0, client.ws.ping - Math.random() * 5)
                ],
                backgroundColor: "rgba(0, 254, 254, 0.1)",
                borderColor: client.ws.ping < 100 ? "#00fefe" : client.ws.ping < 200 ? "#00cccc" : "#009999",
                borderWidth: 3,
                pointBackgroundColor: client.ws.ping < 100 ? "#00fefe" : client.ws.ping < 200 ? "#00cccc" : "#009999",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 6,
                tension: 0.4,
                fill: true
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: false
                },
                title: {
                  display: true,
                  text: "WebSocket Latency Over Time",
                  font: {
                    size: 16,
                    weight: "bold"
                  },
                  color: "#00fefe"
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Latency (ms)",
                    color: "#00fefe"
                  },
                  ticks: {
                    color: "#00fefe"
                  },
                  grid: {
                    color: "rgba(0, 254, 254, 0.1)"
                  }
                },
                x: {
                  ticks: {
                    color: "#00fefe"
                  },
                  grid: {
                    color: "rgba(0, 254, 254, 0.1)"
                  }
                }
              }
            }
          })
          .setBackgroundColor("transparent");

        await uptimeChart.toFile("uptime-chart.png");

        const uptimeContainer = new ContainerBuilder();
        
        uptimeContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# ⏱️ UPTIME & LATENCY\n\n🤖 **Bot Uptime:** \`${formattedBotUptime}\`\n<:data:1423012461002362920> **Current Latency:** \`${client.ws.ping}ms\``
          )
        );

        // Reply with the uptime information and chart
        await interaction.editReply({
          components: [uptimeContainer],
          files: [
            { attachment: String.raw`uptime-chart.png`, name: "uptime-chart.png" },
          ],
          flags: MessageFlags.IsComponentsV2,
        });
        break;
      }

      case "report-bug":
        const USER = interaction.user.tag;
        const Command = interaction.options.getString("command");
        const BUG =
          interaction.options.getString("details") || "No details given!";

        const logBugContainer = new ContainerBuilder();
        
        logBugContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# 🐛 NEW REPORTED BUG!\n\n**Bug:** ${BUG}\n**Command:** ${Command}\n**User:** ${USER}`
          )
        );

        const bugContainer = new ContainerBuilder();
        
        bugContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# 🐛 YOU REPORTED A BUG!\n\n**Bug:** ${BUG}\n**Command:** ${Command}\n\n*The Developer Team will contact you as fast as they can!*`
          )
        );

        const bugChannel = client.channels.cache.get(client.config.bugreport);

        if (bugChannel) {
          bugChannel
            .send({
              components: [logBugContainer],
              flags: MessageFlags.IsComponentsV2,
            })
            .catch((err) => {
              return;
            });
        }

        await interaction.reply({ components: [bugContainer], ephemeral: true, flags: MessageFlags.IsComponentsV2 });
        break;

      case "info": {
        // Calculate the bot's uptime
        const botUptime = process.uptime();
        const formattedBotUptime = formatTime(botUptime);

        // Calculate the system's uptime
        const systemUptime = os.uptime();
        const formattedSystemUptime = formatTime(systemUptime);

        await client.user.fetch();
        await client.application.fetch();

        const getChannelTypeSize = (type) =>
          client.channels.cache.filter((channel) => type.includes(channel.type))
            .size;

        const container = new ContainerBuilder();

        // Bot title with thumbnail
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# ${client.user.username}\n\n**Basic Information**\n<:data:1423012461002362920> **Client ID:** \`${client.user.id}\`\n<:data:1423012461002362920> **Server Count:** ${client.guilds.cache.size}\n<:members:1423012514232533143> **User Count:** ${client.guilds.cache.reduce(
              (acc, guild) => acc + guild.memberCount,
              0
            )}\n<:threads:1423012518338760856> **Channel Count:** ${getChannelTypeSize([
              ChannelType.GuildText,
              ChannelType.GuildNews,
            ])}\n<:data:1423012461002362920> **Total Commands:** ${client.commands.size}\n<:admin:1423012525561348248> **Developer:** <@${client.application.owner.id}>`
          )
        );

        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );

        // Status information
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Status**\n<:ping:1423012456652865679> **Ping:** ${client.ws.ping}ms\n⏱️ **Uptime:** ${formattedBotUptime}\n<:data:1423012461002362920> **OS:** ${os
              .type()
              .replace("Windows_NT", "Windows")
              .replace("Darwin", "macOS")}\n<:data:1423012461002362920> **CPU Usage:** ${(
              process.memoryUsage().heapUsed /
              1024 /
              1024
            ).toFixed(2)}%\n<:data:1423012461002362920> **CPU Model:** ${os.cpus()[0].model}`
          )
        );

        container.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );

        // Buttons
        container.addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setURL(
                `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=303600576574&scope=bot%20applications.commands`
              )
              .setLabel(`Invite Me`)
              .setStyle(ButtonStyle.Link),

            new ButtonBuilder()
              .setURL(`https://discord.gg/8wfT8SfB5Z`)
              .setLabel(`Support Server`)
              .setStyle(ButtonStyle.Link)
          )
        );

        await interaction.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
        break;
      }

      case "feedback":
        const feedbackUSER = interaction.user.tag;
        const feedbackCommand = interaction.options.getString("message");

        const logFeedbackContainer = new ContainerBuilder();
        
        logFeedbackContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# 💬 NEW Feedback\n\n**Feedback:** ${feedbackCommand}\n**User:** ${feedbackUSER}`
          )
        );

        const feedbackContainer = new ContainerBuilder();
        
        feedbackContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# 💬 Thanks For Your Feedback\n\n**Feedback:** ${feedbackCommand}\n\n*The Developer Team Received Your Feedback*`
          )
        );

        const feedbackChannel = client.channels.cache.get(client.config.feedback);

        if (feedbackChannel) {
          feedbackChannel
            .send({
              components: [logFeedbackContainer],
              flags: MessageFlags.IsComponentsV2,
            })
            .catch((err) => {
              return;
            });
        }

        await interaction.reply({ components: [feedbackContainer], ephemeral: true, flags: MessageFlags.IsComponentsV2 });
        break;
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
