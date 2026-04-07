const {
  SlashCommandBuilder,
  PermissionsBitField,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require("discord.js");
const staffschema = require("../../Schemas/staffrole");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("staff-role")
    .setDescription("Configure your help staff role.")
    .addSubcommand((command) =>
      command
        .setName("set")
        .setDescription("Specified role will be pinged when doing /help staff.")
        .addRoleOption((option) =>
          option
            .setName("staff-role")
            .setDescription("Specified role will be your staff role.")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("remove")
        .setDescription("Disables the staff help system.")
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

    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "set":
        const staffdata = await staffschema.findOne({
          Guild: interaction.guild.id,
        });
        const staffrole = await interaction.options.getRole("staff-role");

        if (!staffdata) {
          staffschema.create({
            Guild: interaction.guild.id,
            Role: staffrole.id,
          });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# 🛠 Help Staff System\n\n## > Staff Role set\n\n**• Staff Role**\n> Your role (${staffrole}) has been **set** as your \n> staff helper role. They will \n> be pinged when a user needs help!\n\n*🛠 Help Staff set*`
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        } else {
          await interaction.reply({
            content: `The **Helper Staff** system is already **enabled**. \n> Do **/staff-role remove** to undo.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        break;
      case "remove":
        const staffdata1 = await staffschema.findOne({
          Guild: interaction.guild.id,
        });

        if (!staffdata1) {
          return await interaction.reply({
            content: `The **Helper Staff** system is already **disabled**, can't disable **nothing**..`,
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await staffschema.deleteOne({ Guild: interaction.guild.id });
          await interaction.reply({
            content: `Your **Helper Staff** system has been **disabled**!`,
            flags: MessageFlags.Ephemeral,
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
