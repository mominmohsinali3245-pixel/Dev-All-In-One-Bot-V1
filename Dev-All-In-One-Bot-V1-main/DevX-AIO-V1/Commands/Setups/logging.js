const {
  SlashCommandBuilder,
  PermissionsBitField,
  ChannelType,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  SeparatorSpacingSize,
} = require("discord.js");
const logSchema = require("../../Schemas/logschema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Configure your logging system.")
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("Sets up your logging system.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Specified channel will receive logs.")
            .setRequired(false)
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement
            )
        )
    )
    .addSubcommand((command) =>
      command.setName("disable").setDescription("Disables your logging system.")
    ),
  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: "You **do not** have the permission to do that!",
        ephemeral: true,
      });

    const sub = await interaction.options.getSubcommand();
    const data = await logSchema.findOne({ Guild: interaction.guild.id });

    switch (sub) {
      case "setup":
        if (data)
          return await interaction.reply({
            content: `You have **already** set up the logging system! \n> Do **/logs disable** to undo.`,
            ephemeral: true,
          });
        else {
          const logchannel =
            interaction.options.getChannel("channel") || interaction.channel;

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# 🚧 Logging Enabled`)
          );
          container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
          );
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Logging was Enabled**\nYour logging system has been set up successfully. Your channel will now receive alerts for actions taken in your server!`
            )
          );
          container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
          );
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**Channel:** ${logchannel}`)
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });

          await logSchema.create({
            Guild: interaction.guild.id,
            Channel: logchannel.id,
          });
        }

        break;
      case "disable":
        if (!data)
          return await interaction.reply({
            content: `You have **not** set up the logging system! \n> Do **/logs setup** to set it up.`,
            ephemeral: true,
          });
        else {
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# 🚧 Logging Disabled`)
          );
          container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
          );
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Logging was Disabled**\nYour logging system has been disabled successfully. Your logging channel will no longer receive alerts for actions taken in your server!`
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });

          await logSchema.deleteMany({ Guild: interaction.guild.id });
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
