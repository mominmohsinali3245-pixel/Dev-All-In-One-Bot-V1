

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  SeparatorSpacingSize,
} = require("discord.js");
const { mongoose } = require("mongoose");

module.exports = {
  name: "ping",
  aliases: ["latency", "ms"],
  args: false,
  owner: false,

  async execute(message, client, args) {
    const msg = await message.reply("🏓 Pinging...");

    // Get Mongoose ping - check if model exists first
    let Test;
    try {
      Test = mongoose.model("Test");
    } catch {
      Test = mongoose.model("Test", { name: String });
    }
    
    const dbPingStart = Date.now();
    await Test.findOne();
    const dbPing = Date.now() - dbPingStart;

    const container = new ContainerBuilder();
    
    // Title
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# <:ping:1423012456652865679> Bot Latency`
      )
    );

    // Separator
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    // Latency Information
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `<:dots:1423015515026100386> **WebSocket Latency:** \`${client.ws.ping}ms\`\n<:dots:1423015515026100386> **Database Ping:** \`${dbPing}ms\`\n<:dots:1423015515026100386> **Message Latency:** \`${msg.createdTimestamp - message.createdTimestamp}ms\``
      )
    );

    // Separator
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    // Divider
    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

    await msg.edit({
      content: null,
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
