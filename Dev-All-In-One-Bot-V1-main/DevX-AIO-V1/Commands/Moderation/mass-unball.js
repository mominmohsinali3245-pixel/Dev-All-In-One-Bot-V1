const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mass-unban")
    .setDMPermission(false)
    .setDescription("Unban all members in the server. Use with caution!"),

  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      ) &&
      interaction.user.id !== "870179991462236170"
    )
      return await interaction.reply({
        content: "You **do not** have the permission to do that!",
        ephemeral: true,
      });

    try {
      const bannedMembers = await interaction.guild.bans.fetch();

      await Promise.all(
        bannedMembers.map((member) => {
          return interaction.guild.members.unban(member.user.id).catch(() => {});
        })
      );

      return interaction.reply({
        content: "All members have been **unbanned** from the server.",
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "An error occurred while **unbanning** members.",
        ephemeral: true,
      });
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
