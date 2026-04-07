const {
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
    .setName("Avatar")
    .setType(ApplicationCommandType.User)
    .setDMPermission(false),
  async execute(interaction, client) {
    const container = new ContainerBuilder();
    
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${interaction.targetUser.username}'s Avatar\n\n[View Full Size Avatar](${interaction.targetUser.displayAvatarURL({ size: 4096 })})`
      )
    );

    await interaction.reply({
      components: [container],
      ephemeral: true,
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
