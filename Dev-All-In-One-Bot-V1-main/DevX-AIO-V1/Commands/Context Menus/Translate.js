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
const translate = require("@iamtraction/google-translate");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Translate")
    .setType(ApplicationCommandType.Message)
    .setDMPermission(false),
  /**
   *
   * @param {ContextMenuInteraction} interaction
   */
  async execute(interaction, client) {
    const { channel, targetId } = interaction;

    const query = await channel.messages.fetch(targetId);
    const raw = query.content;

    const translated = await translate(query, { to: "en" });

    const container = new ContainerBuilder();
    
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# Translated to English Language`
      )
    );

    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Your text:**\n\`\`\`${raw}\`\`\``
      )
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Translated text:**\n\`\`\`${translated.text}\`\`\``
      )
    );

    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `*Requested by ${interaction.user.username}*`
      )
    );

    return interaction.reply({
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
