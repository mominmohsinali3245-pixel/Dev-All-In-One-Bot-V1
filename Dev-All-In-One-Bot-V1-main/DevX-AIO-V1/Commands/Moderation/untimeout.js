const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  PermissionsBitField,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Untimesout a server member")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user you would like to untimeout")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for untiming out the user")
    ),
  async execute(interaction, message, client) {
    const timeUser = interaction.options.getUser("target");
    const timeMember = await interaction.guild.members.fetch(timeUser.id);

    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ModerateMembers
      )
    )
      return interaction.reply({
        content:
          "You must have the Moderate Members permission to use this command!",
        ephemeral: true,
      });
    if (!timeMember.kickable)
      return interaction.reply({
        content:
          "I cannot timeout this user! This is either because their higher then me or you.",
        ephemeral: true,
      });
    if (interaction.member.id === timeMember.id)
      return interaction.reply({
        content: "You cannot timeout yourself!",
        ephemeral: true,
      });
    if (timeMember.permissions.has(PermissionsBitField.Flags.Administrator))
      return interaction.reply({
        content:
          "You cannot untimeout staff members or people with the Administrator permission!",
        ephemeral: true,
      });

    let reason = interaction.options.getString("reason");
    if (!reason) reason = "No reason given.";

    await timeMember.timeout(null, reason);

    const dmContainer = new ContainerBuilder();
    dmContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`You have been **untimed out** in ${interaction.guild.name} | ${reason}`)
    );

    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${timeUser.tag}'s timeout has been **removed** | ${reason}`)
    );

    await timeMember.send({ components: [dmContainer], flags: MessageFlags.IsComponentsV2 }).catch((err) => {
      return;
    });

    await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
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
