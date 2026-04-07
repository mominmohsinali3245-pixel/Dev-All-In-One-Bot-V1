const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  PermissionsBitField,
  SlashCommandBuilder,
} = require("discord.js");
var timeout = [];
const staffschema = require("../../Schemas/staffrole");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("staff-help")
    .setDescription("Ping for help!"),
  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      ) &&
      timeout.includes(interaction.member.id) &&
      interaction.user.id !== "870179991462236170"
    )
      return await interaction.reply({
        content: "You are on cooldown! You **cannot** execute /help staff.",
        ephemeral: true,
      });

    const staffdata = await staffschema.findOne({
      Guild: interaction.guild.id,
    });

    if (!staffdata) {
      return await interaction.reply({
        content: `This **feature** has not been **set up** in this server yet!`,
        ephemeral: true,
      });
    } else {
      const staffcontainer = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# • Staff team Pinged\n\n🛠 Help Staff system\n\n> You will be assisted shortly!\n> Sit tight.\n\n*🛠 Staff Team pinged*`
          )
        );

      const staffrole = staffdata.Role;
      const memberslist = await interaction.guild.roles.cache
        .get(staffrole)
        .members.filter((member) => member.presence?.status !== "offline")
        .map((m) => m.user)
        .join("\n> ");

      if (!memberslist) {
        return await interaction.reply({
          content: `There are **no** staff available **at the moment**! Try again later..`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `> ${memberslist}`,
          components: [staffcontainer],
          flags: MessageFlags.IsComponentsV2,
        });

        timeout.push(interaction.user.id);
        setTimeout(() => {
          timeout.shift();
        }, 60000);
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
