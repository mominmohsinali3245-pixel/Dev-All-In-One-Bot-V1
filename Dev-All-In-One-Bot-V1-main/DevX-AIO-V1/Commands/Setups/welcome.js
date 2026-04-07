const { SlashCommandBuilder } = require("@discordjs/builders");
const { 
  ContainerBuilder, 
  TextDisplayBuilder, 
  MessageFlags, 
  PermissionsBitField 
} = require("discord.js");
const weschema = require("../../Schemas/welcome");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome-channel")
    .setDMPermission(false)
    .setDescription("Configure your server's welcome channel.")
    .addSubcommand((command) =>
      command
        .setName("set")
        .setDescription("Sets your welcome channel.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Specified channel will be your welcome channel.")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command.setName("remove").setDescription("Removes your welcome channel.")
    ),
  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      ) &&
      interaction.user.id !== "870179991462236170"
    )
      return await interaction.reply({
        content: "You **do not** have the permission to do that!",
        flags: MessageFlags.Ephemeral,
      });

    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "set":
        const channel = interaction.options.getChannel("channel");
        const welcomedata = await weschema.findOne({
          Guild: interaction.guild.id,
        });

        if (welcomedata)
          return interaction.reply({
            content: `You **already** have a welcome channel! (<#${welcomedata.Channel}>) \n> Do **/welcome-channel remove** to undo.`,
            flags: MessageFlags.Ephemeral,
          });
        else {
          await weschema.create({
            Guild: interaction.guild.id,
            Channel: channel.id,
          });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# ⚙️ Welcome Channel Tool\n\n## > Your welcome channel has \n> been set successfully!\n\n**• Channel was Set**\n> The channel ${channel} has been \n> set as your Welcome Channel.\n\n*⚙️ Use /remove-welcome-channel to undo*`
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        }

        break;

      case "remove":
        if (
          !interaction.member.permissions.has(
            PermissionsBitField.Flags.Administrator
          ) &&
          interaction.user.id !== "870179991462236170"
        )
          return await interaction.reply({
            content: "You **do not** have the permission to do that!",
            flags: MessageFlags.Ephemeral,
          });

        const weldata = await weschema.findOne({ Guild: interaction.guild.id });
        if (!weldata)
          return await interaction.reply({
            content: `You **do not** have a welcome channel yet. \n> Do **/welcome-channel set** to set up one.`,
            flags: MessageFlags.Ephemeral,
          });
        else {
          await weschema.deleteMany({
            Guild: interaction.guild.id,
          });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# ⚙️ Welcome Channel Tool\n\n## > Your welcome channel has \n> been removed successfully!\n\n**• Your Channel was Removed**\n> The channel you have previously set \n> as your welcome channel will no longer \n> receive updates.\n\n*⚙️ Use /set-welcome-channel to set your channel*`
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
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
