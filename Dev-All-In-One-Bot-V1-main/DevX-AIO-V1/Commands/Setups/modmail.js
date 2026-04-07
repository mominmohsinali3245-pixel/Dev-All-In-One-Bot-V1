const {
  SlashCommandBuilder,
  PermissionsBitField,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
  ChannelType,
} = require("discord.js");
const modschema = require("../../Schemas/modmailschema");
const moduses = require("../../Schemas/modmailuses");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modmail")
    .setDescription("Configure your modmail system.")
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("Sets up your modmail system of Rebelz.")
        .addChannelOption((option) =>
          option
            .setName("category")
            .setDescription("Specified category will receive your modmails.")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildCategory)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("disable")
        .setDescription("Disables the modmail system of Rebelz.")
    )
    .addSubcommand((command) =>
      command
        .setName("close")
        .setDescription("Closes your currently active modmail.")
    ),
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "setup":
        if (!interaction.guild)
          return await interaction.reply({
            content: `You **cannot** use this command in **DMs**!`,
            flags: MessageFlags.Ephemeral,
          });

        const data1 = await modschema.findOne({ Guild: interaction.guild.id });
        if (
          !interaction.member.permissions.has(
            PermissionsBitField.Flags.Administrator
          )
        )
          return await interaction.reply({
            content: "You **do not** have the permission to do that!",
            flags: MessageFlags.Ephemeral,
          });

        if (data1)
          return await interaction.reply({
            content: `You have **already** set up the **modmail** in this server. \n> Do **/modmail disable** to undo.`,
            flags: MessageFlags.Ephemeral,
          });
        else {
          const category = await interaction.options.getChannel("category");

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# 📬 Modmail System\n\n## > Modmail Enabled\n\n**• Modmail was Enabled**\n> Your members will now be able to contact \n> you by sending me a direct message!\n\n**• Category**\n> ${category}\n\n*📬 Modmail Setup*`
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });

          await modschema.create({
            Guild: interaction.guild.id,
            Category: category.id,
          });
        }

        break;
      case "disable":
        if (!interaction.guild)
          return await interaction.reply({
            content: `You **cannot** use this command in **DMs**!`,
            flags: MessageFlags.Ephemeral,
          });

        const data = await modschema.findOne({ Guild: interaction.guild.id });
        if (
          !interaction.member.permissions.has(
            PermissionsBitField.Flags.Administrator
          )
        )
          return await interaction.reply({
            content: "You **do not** have the permission to do that!",
            flags: MessageFlags.Ephemeral,
          });

        if (!data)
          return await interaction.reply({
            content: `You have **not** set up the **modmail** in this server.`,
            flags: MessageFlags.Ephemeral,
          });
        else {
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# 📬 Modmail System\n\n## > Modmail Disabled\n\n**• Modmail was Disabled**\n> Your members will no longer be able to contact \n> you by sending me a direct message.\n\n*📬 Modmail Removed*`
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
          await modschema.deleteMany({ Guild: interaction.guild.id });
        }

        break;
      case "close":
        const usedata = await moduses.findOne({ User: interaction.user.id });

        if (!usedata)
          return await interaction.reply({
            content: `You **do not** have an open **modmail**!`,
            flags: MessageFlags.Ephemeral,
          });
        else {
          const channel = await client.channels.cache.get(usedata.Channel);
          if (!channel) {
            await interaction.reply({
              content: `Your **modmail** has been **closed**!`,
              flags: MessageFlags.Ephemeral,
            });
            await moduses.deleteMany({ User: interaction.user.id });
          } else {
            await interaction.reply({
              content: `Your **modmail** has been **closed** in **${channel.guild.name}**!`,
              flags: MessageFlags.Ephemeral,
            });
            await moduses.deleteMany({ User: interaction.user.id });
            await channel.send({
              content: `⚠️ ${interaction.user} has **closed** their **modmail**!`,
            });
          }
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
