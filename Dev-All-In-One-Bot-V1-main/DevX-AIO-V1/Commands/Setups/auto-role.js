const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");
const roleschema = require("../../Schemas/autorole");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("auto-role")
    .setDMPermission(false)
    .setDescription(
      "Configure an automatic role that is given to your Members when joining."
    )
    .addSubcommand((command) =>
      command
        .setName("set")
        .setDescription("Set your auto-role.")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("Specified role will be your auto-role.")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command.setName("remove").setDescription("Removes your auto-role.")
    ),
  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageRoles
      ) &&
      interaction.user.id !== "870179991462236170"
    )
      return await interaction.reply({
        content: "You **do not** have the permission to do that!",
        ephemeral: true,
      });
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "set":
        const role = interaction.options.getRole("role");

        const roledata = await roleschema.findOne({
          Guild: interaction.guild.id,
        });
        if (roledata)
          return await interaction.reply({
            content: `You **already** have an auto-role set up! (<@&${roledata.Role}>)`,
            ephemeral: true,
          });
        else {
          await roleschema.create({
            Guild: interaction.guild.id,
            Role: role.id,
          });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `⚙️ **Auto-Role tool**\n\n# Auto role has been successfully set!\n\n**• Auto Role was set**\n> New Auto-Role is ${role}\n\n⚙️ Do /auto-role remove to undo`
            )
          );

          await interaction.reply({ 
            components: [container],
            flags: MessageFlags.IsComponentsV2
          });
        }

        break;
      case "remove":
        const removedata = await roleschema.findOne({
          Guild: interaction.guild.id,
        });
        if (!removedata)
          return await interaction.reply({
            content: `You **do not** have an auto role set up! **Cannot** remove **nothing**..`,
            ephemeral: true,
          });
        else {
          await roleschema.deleteMany({
            Guild: interaction.guild.id,
          });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `⚙️ **Auto-Role tool**\n\n# Auto role has been successfully disabled!\n\n**• Auto Role was disabled**\n> Your members will no longer receive \n> your auto role\n\n⚙️ Do /auto-role set to undo`
            )
          );

          await interaction.reply({ 
            components: [container],
            flags: MessageFlags.IsComponentsV2
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
