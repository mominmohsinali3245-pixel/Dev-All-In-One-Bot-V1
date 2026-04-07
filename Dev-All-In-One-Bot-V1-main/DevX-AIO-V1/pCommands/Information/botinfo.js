const {
  Client,
  ChannelType,
  UserFlags,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  ActionRowBuilder,
  version,
} = require("discord.js");
const os = require("os");

module.exports = {
  name: "botinfo",
  aliases: ["stats", "status"],
  args: false,
  owner: false,

  async execute(message, client, args) {
    const { formatTime } = require("../../Handlers/time");
    
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

    await message.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
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
