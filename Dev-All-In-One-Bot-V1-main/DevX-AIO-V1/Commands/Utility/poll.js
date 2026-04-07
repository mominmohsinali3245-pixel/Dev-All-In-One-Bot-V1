const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");
const pollschema = require("../../Schemas/votesetup");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Configure your poll system.")
    .setDMPermission(false)
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription(
          "Sets up your poll system. Messages sent to specified channel will become polls."
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Specified channel will become your poll channel.")
            .setRequired(false)
            .addChannelTypes(
              ChannelType.GuildAnnouncement,
              ChannelType.GuildText
            )
        )
    )
    .addSubcommand((command) =>
      command
        .setName("disable")
        .setDescription("Disables the poll system for you.")
    ),
  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      ) &&
      interaction.user.id !== "619944734776885276"
    )
      return await interaction.reply({
        content: "You **do not** have the permission to do that!",
        flags: MessageFlags.Ephemeral,
      });

    const sub = await interaction.options.getSubcommand();
    const data = await pollschema.findOne({ Guild: interaction.guild.id });

    switch (sub) {
      case "setup":
        if (data)
          return await interaction.reply({
            content: `You have **already** enabled the **poll system** within this server. \n> Do **/poll disable** to undo.`,
            flags: MessageFlags.Ephemeral,
          });
        else {
          const channel =
            (await interaction.options.getChannel("channel")) ||
            interaction.channel;

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# 🤚 Poll System\n\n## > Polls were Enabled\n\n**• Polls Enabled**\n> Polls were enabled. You will now \n> be able to convert all messages sent \n> within your channel into fancy embeded polls.\n\n**• Channel**\n> ${channel}\n\n*🤚 Poll Enabled*`
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });

          await pollschema.create({
            Guild: interaction.guild.id,
            Channel: channel.id,
          });
        }

        break;
      case "disable":
        if (!data)
          return await interaction.reply({
            content: `You have **not** enabled the **poll system** within this server.`,
            flags: MessageFlags.Ephemeral,
          });
        else {
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# 🤚 Poll System\n\n## > Polls were Disabled\n\n**• Polls Disabled**\n> Polls were Disabled. You will no longer \n> be able to convert messages sent \n> to <#${data.Channel}> into fancy embeded polls.\n\n*🤚 Poll Disabled*`
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });

          await pollschema.deleteMany({
            Guild: interaction.guild.id,
          });
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
