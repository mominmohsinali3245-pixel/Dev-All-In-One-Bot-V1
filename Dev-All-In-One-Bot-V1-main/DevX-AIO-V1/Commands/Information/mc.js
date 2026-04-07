const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  SeparatorSpacingSize,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("membercount")
    .setDescription("Shows the member count of the server."),

  async execute(interaction, client) {
    const container = new ContainerBuilder();

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${interaction.guild.name} Member Count`
      )
    );

    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `<:members:1423012514232533143> **Total Members:** ${interaction.guild.memberCount}\n<:bot:1423012516123906211> **Total Bots:** ${interaction.guild.members.cache.filter(member => member.user.bot).size}\n<:members:1423012514232533143> **Total Humans:** ${interaction.guild.members.cache.filter(member => !member.user.bot).size}`
      )
    );

    await interaction.reply({
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
