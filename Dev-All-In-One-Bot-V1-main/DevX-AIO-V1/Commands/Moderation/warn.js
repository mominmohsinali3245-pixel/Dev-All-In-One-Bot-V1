const {
  SlashCommandBuilder,
  PermissionsBitField,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require("discord.js");
const warningSchema = require("../../Schemas/warnSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("This warns a server member")
    .addSubcommand((command) =>
      command
        .setName("user")
        .setDescription(
          `warn a user for his mistake or breaking any kind of rule`
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to warn")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("This is the reason for warning the user")
            .setRequired(false)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("remove")
        .setDescription("This clears a members warnings")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to clear the warnings of")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("show")
        .setDescription("This gets a members warnings")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The member you want to check the warns of")
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "user":
        if (
          !interaction.member.permissions.has(
            PermissionsBitField.Flags.KickMembers
          )
        )
          return await interaction.reply({
            content: "You don't have permission to warn people!",
            ephemeral: true,
          });

        const { options, guildId, user } = interaction;

        const target = options.getUser("user");
        const reason = options.getString("reason") || "No reason given";

        const userTag = target.tag;

        try {
          let data = await warningSchema.findOne({
            GuildID: guildId,
            UserID: target.id,
            UserTag: userTag,
          });

          if (!data) {
            data = new warningSchema({
              GuildID: guildId,
              UserID: target.id,
              UserTag: userTag,
              Content: [
                {
                  ExecuterId: user.id,
                  ExecuterTag: user.tag,
                  Reason: reason,
                },
              ],
            });
          } else {
            const warnContent = {
              ExecuterId: user.id,
              ExecuterTag: user.tag,
              Reason: reason,
            };
            data.Content.push(warnContent);
          }
          await data.save();

          const dmContainer = new ContainerBuilder();
          dmContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# <:error:1423012534025326824> Important Notice\n\nYou have been warned in ${interaction.guild.name} by <@${interaction.user.id}>\nFor: \`${reason}\``
            )
          );

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `✅ ${target.tag} has been **warned** | ${reason}`
            )
          );

          await target
            .send({ components: [dmContainer], flags: MessageFlags.IsComponentsV2 })
            .catch((err) => {
              return;
            });

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        } catch (err) {
          console.error(err);
          return interaction.reply({
            content: "An error occurred while warning the user.",
            ephemeral: true,
          });
        }
        break;

      case "remove":
        if (
          !interaction.member.permissions.has(
            PermissionsBitField.Flags.KickMembers
          )
        )
          return await interaction.reply({
            content: "You don't have permission to clear people's warnings!",
            ephemeral: true,
          });

        const { options: removeOptions, guildId: removeGuildId } = interaction;

        const removeTarget = removeOptions.getUser("user");

        try {
          const data = await warningSchema.findOne({
            GuildID: removeGuildId,
            UserID: removeTarget.id,
            UserTag: removeTarget.tag,
          });

          if (data) {
            await warningSchema.findOneAndDelete({
              GuildID: removeGuildId,
              UserID: removeTarget.id,
              UserTag: removeTarget.tag,
            });

            const removeContainer = new ContainerBuilder();
            removeContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `✅ ${removeTarget.tag}'s warnings have been cleared`
              )
            );

            await interaction.reply({
              components: [removeContainer],
              flags: MessageFlags.IsComponentsV2,
            });
          } else {
            await interaction.reply({
              content: `${removeTarget.tag} has no warnings to be cleared`,
              ephemeral: true,
            });
          }
        } catch (err) {
          console.error(err);
          return interaction.reply({
            content: "An error occurred while clearing warnings.",
            ephemeral: true,
          });
        }
        break;

      case "show":
        const { options: showOptions, guildId: showGuildId } = interaction;

        const showTarget = showOptions.getUser("user");

        try {
          const data = await warningSchema.findOne({
            GuildID: showGuildId,
            UserID: showTarget.id,
            UserTag: showTarget.tag,
          });

          if (data) {
            const warningsList = data.Content.map(
              (w, i) =>
                `**Warning**: ${i + 1}\n**Warning Moderator**: ${
                  w.ExecuterTag
                }\n**Warn Reason**: ${w.Reason}`
            ).join(`\n\n-\n\n`);

            const showContainer = new ContainerBuilder();
            showContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `✅ ${showTarget.tag}'s warnings:\n\n${warningsList}`
              )
            );

            await interaction.reply({
              components: [showContainer],
              flags: MessageFlags.IsComponentsV2,
            });
          } else {
            const noWarnsContainer = new ContainerBuilder();
            noWarnsContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `✅ ${showTarget.tag} has **0** warnings!`
              )
            );

            await interaction.reply({
              components: [noWarnsContainer],
              flags: MessageFlags.IsComponentsV2,
            });
          }
        } catch (err) {
          console.error(err);
          return interaction.reply({
            content: "An error occurred while fetching warnings.",
            ephemeral: true,
          });
        }
        break;
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
