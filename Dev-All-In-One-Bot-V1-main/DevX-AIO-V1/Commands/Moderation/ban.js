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
    .setName("ban")
    .setDMPermission(false)
    .setDescription("Bans specified user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Specify the user you want to ban.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason as to why you want to ban specified user.")
        .setRequired(false)
    ),
  async execute(interaction, client) {
    const users = interaction.options.getUser("user");
    const ID = users.id;
    const banUser = client.users.cache.get(ID);
    const banmember = interaction.options.getMember("user");

    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)
    )
      return await interaction.reply({
        content: "You **do not** have the permission to do that!",
        ephemeral: true,
      });
    if (interaction.member.id === ID)
      return await interaction.reply({
        content: "You **cannot** use the hammer on you, silly goose..",
        ephemeral: true,
      });

    if (!banmember)
      return await interaction.reply({
        content: `That user **does not** exist within your server.`,
        ephemeral: true,
      });

    let reason = interaction.options.getString("reason");
    if (!reason) reason = "No reason provided :(";

    const dmContainer = new ContainerBuilder();
    dmContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🔨 Ban Tool\n\n> You were banned from "${interaction.guild.name}"`)
    );
    dmContainer.addSeparatorComponents(new SeparatorBuilder());
    dmContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• Server:** ${interaction.guild.name}\n**• Reason:** ${reason}`)
    );
    dmContainer.addSeparatorComponents(new SeparatorBuilder());
    dmContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`🔨 The ban hammer strikes again`)
    );

    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🔨 Ban Tool\n\n> User was bannished!`)
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**• User:** ${banUser.tag}\n**• Reason:** ${reason}`)
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`🔨 The ban hammer strikes again`)
    );

    await interaction.guild.bans.create(banUser.id, { reason }).catch((err) => {
      return interaction.reply({
        content: `**Couldn't** ban this member! Check my **role position** and try again.`,
        ephemeral: true,
      });
    });

    await banUser.send({ components: [dmContainer], flags: MessageFlags.IsComponentsV2 }).catch((err) => {
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
