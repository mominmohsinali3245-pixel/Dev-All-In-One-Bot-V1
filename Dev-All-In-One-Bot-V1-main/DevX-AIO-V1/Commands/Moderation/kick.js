const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  PermissionsBitField,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDMPermission(false)
    .setDescription("Kicks specified user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Specify the user you want to kick.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason as to why you want to kick specified user.")
        .setRequired(false)
    ),
  async execute(interaction, client) {
    const users = interaction.options.getUser("user");
    const ID = users.id;
    const kickedmember = interaction.options.getMember("user");

    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)
    )
      return await interaction.reply({
        content: "You **do not** have the permission to do that!",
        ephemeral: true,
      });
    if (interaction.member.id === ID)
      return await interaction.reply({
        content: "You **cannot** use the kick power on you, silly goose..",
        ephemeral: true,
      });

    if (!kickedmember)
      return await interaction.reply({
        content: `That user **does not** exist within your server.`,
        ephemeral: true,
      });

    const reason =
      interaction.options.getString("reason") || "No reason provided :(";

    const dmContainer = new ContainerBuilder();
    dmContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🔨 Kick Tool\n\n> You were kicked from "${interaction.guild.name}"`)
    );
    dmContainer.addSeparatorComponents(new SeparatorBuilder());
    dmContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• Server:** ${interaction.guild.name}\n**• Reason:** ${reason}`)
    );
    dmContainer.addSeparatorComponents(new SeparatorBuilder());
    dmContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`🔨 Kicked from a server`)
    );

    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🔨 Kick Tool\n\n> User was kicked!`)
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• User:** ${users.tag}\n**• Reason:** ${reason}`)
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`🔨 Someone got kicked hard`)
    );

    await kickedmember.kick().catch((err) => {
      return interaction.reply({
        content: `**Couldn't** kick this member! Check my **role position** and try again.`,
        ephemeral: true,
      });
    });

    await kickedmember.send({ components: [dmContainer], flags: MessageFlags.IsComponentsV2 }).catch((err) => {
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
