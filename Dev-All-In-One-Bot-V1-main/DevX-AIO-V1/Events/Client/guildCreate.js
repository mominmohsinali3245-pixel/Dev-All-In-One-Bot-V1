const {
  Events,
  Guilds,
  Client,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
  ChannelType,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");

module.exports = {
  name: "guildCreate",
  once: false,
  async execute(guild, client) {
    const channel = guild.channels.cache
      .filter((c) => c.type === ChannelType.GuildText)
      .sort((a, b) => a.rawPosition - b.rawPosition || a.id - b.id)
      .first();
    if (!channel) return;

    const container = new ContainerBuilder();
    
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# Hi, I am Rebelz\n\n**Advanced futuristic discord bot with many amazing high functional features like MiniGames, Giveaways, Counting system and many more.**\n\n**Guidelines**\n> • I am only running on **slash commands**. <:download:1423012542590226546>\n> • Find my all commands by using </help:1087992591741624351> command. \n> • Use </bot report-bug:1234> if you found any **bug**. \n\n🎟️ **If you need any help feel free to join our support server**. \n⚠️ **Make sure to give my required permissions.**\n\n*#KeepEvolving*`
      )
    );

    container.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Support")
          .setStyle(ButtonStyle.Link)
          .setURL("https://nexr75.vercel.app"),

        new ButtonBuilder()
          .setLabel("Vote")
          .setStyle(ButtonStyle.Link)
          .setURL("https://nexr75.vercel.app")
      )
    );

    channel.send({ 
      components: [container], 
      flags: MessageFlags.IsComponentsV2 
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
