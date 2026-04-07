const {
  ContextMenuInteraction,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  SeparatorSpacingSize,
} = require("discord.js");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("UserInfo")
    .setType(ApplicationCommandType.User)
    .setDMPermission(false),
  /**
   *
   * @param {ContextMenuInteraction} interaction
   */
  async execute(interaction, client) {
    const target = await interaction.guild.members.fetch(interaction.targetId);
    const user = await interaction.guild.members.fetch(target.id);

    const container = new ContainerBuilder();
    
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${target.user.tag}\n\n[View Avatar](${target.user.displayAvatarURL()})`
      )
    );

    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Member:** ${target}\n**Nickname:** ${target.nickname || "None"}\n**Bot Account:** ${user.bot ? "True" : "False"}`
      )
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Roles:**\n${target.roles.cache.map((r) => r).join(" ")}`
      )
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Joined Server:** <t:${parseInt(target.joinedAt / 1000)}:R>\n**Joined Discord:** <t:${parseInt(target.user.createdAt / 1000)}:R>`
      )
    );

    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `*User ID: ${target.user.id}*`
      )
    );

    await interaction.reply({ components: [container], ephemeral: true, flags: MessageFlags.IsComponentsV2 });
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
