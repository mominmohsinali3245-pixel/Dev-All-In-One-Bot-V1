const {
  SlashCommandBuilder,
  PermissionsBitField,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  SeparatorSpacingSize,
} = require(`discord.js`);
const ms = require("ms");
const { mongoose } = require(`mongoose`);

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`giveaway`)
    .setDescription(`Start a giveaway or configure already existing ones.`)
    .addSubcommand((command) =>
      command
        .setName("start")
        .setDescription("Starts a giveaway with the specified fields.")
        .addStringOption((option) =>
          option
            .setName("duration")
            .setDescription(
              `Specified duration will be the giveaway's duration (in ms)`
            )
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("winners")
            .setDescription(
              "Specified amount will be the amount of winners chosen."
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("prize")
            .setDescription(
              "Specified prize will be the prize for the giveaway."
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Specified channel will receive the giveaway.")
        )
        .addStringOption((option) =>
          option
            .setName("content")
            .setDescription(
              "Specified content will be used for the giveaway embed."
            )
        )
    )
    .addSubcommand((command) =>
      command
        .setName(`edit`)
        .setDescription(`Edits specified giveaway.`)
        .addStringOption((option) =>
          option
            .setName("message-id")
            .setDescription(
              "Specify the message ID of the giveaway you want to edit."
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("time")
            .setDescription(
              "Specify the added duration of the giveaway (in ms)."
            )
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("winners")
            .setDescription("Specify the new ammount of winners.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("prize")
            .setDescription("Specify the new prize for the giveaway.")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("end")
        .setDescription(`Ends specified giveaway.`)
        .addStringOption((option) =>
          option
            .setName("message-id")
            .setDescription(
              "Specify the message ID of the giveaway you want to end."
            )
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName(`reroll`)
        .setDescription(`Rerolls specified giveaway.`)
        .addStringOption((option) =>
          option
            .setName("message-id")
            .setDescription(
              "Specify the message ID of the giveaway you want to reroll."
            )
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageChannels
      )
    ) {
      const errorContainer = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# Giveaway Commands\n\nYou **do not** have the permission to do that!`
          )
        );

      return await interaction.reply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }

    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "start": {
        const startingContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# Giveaway Commands\n\n**Starting** your giveaway..`
            )
          );

        await interaction.reply({
          components: [startingContainer],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });

        const duration = ms(interaction.options.getString("duration") || "");
        const winnerCount = interaction.options.getInteger("winners");
        const prize = interaction.options.getString("prize");
        const channel = interaction.options.getChannel("channel") || interaction.channel;

        try {
          await client.giveawayManager.start(channel, {
            prize,
            winnerCount,
            duration,
            hostedBy: interaction.user,
          });

          const successContainer = new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `# Giveaway Commands\n\nYour **giveaway** has started successfully! Check ${channel}.`
              )
            );

          await interaction.editReply({
            components: [successContainer],
            flags: MessageFlags.IsComponentsV2,
          });
        } catch (err) {
          const errorContainer = new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `# Giveaway Commands\n\nAn **error** occurred while starting the giveaway.\n\n> **Error**: ${err.message}`
              )
            );

          await interaction.editReply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2,
          });
        }

        break;
      }

      case "edit": {
        const editingContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# Giveaway Commands\n\n**Editing** your giveaway..`
            )
          );

        await interaction.reply({
          components: [editingContainer],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });

        const newprize = interaction.options.getString("prize");
        const newduration = interaction.options.getString("time");
        const newwinners = interaction.options.getInteger("winners");
        const messageId = interaction.options.getString("message-id");
        client.giveawayManager
          .edit(messageId, {
            addTime: ms(newduration),
            newWinnerCount: newwinners,
            newPrize: newprize,
          })
          .then(() => {
            const editSuccessContainer = new ContainerBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `# Giveaway Commands\n\nYour **giveaway** has been **edited** successfully!`
                )
              );

            interaction.editReply({
              components: [editSuccessContainer],
              flags: MessageFlags.IsComponentsV2,
            });
          })
          .catch((err) => {
            const editErrorContainer = new ContainerBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `# Giveaway Commands\n\nAn **error** occurred!\n\n> **Error**: ${err.message}`
                )
              );

            interaction.editReply({
              components: [editErrorContainer],
              flags: MessageFlags.IsComponentsV2,
            });
          });

        break;
      }

      case "end": {
        const endingContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# Giveaway Commands\n\n**Ending** your giveaway..`
            )
          );

        await interaction.reply({
          components: [endingContainer],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });

        const messageId1 = interaction.options.getString("message-id");
        client.giveawayManager
          .end(messageId1)
          .then(() => {
            const endSuccessContainer = new ContainerBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `# Giveaway Commands\n\nYour **giveaway** has ended **successfully!**`
                )
              );

            interaction.editReply({
              components: [endSuccessContainer],
              flags: MessageFlags.IsComponentsV2,
            });
          })
          .catch((err) => {
            const endErrorContainer = new ContainerBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `# Giveaway Commands\n\nAn **error** occurred!\n\n> **Error**: ${err.message}`
                )
              );

            interaction.editReply({
              components: [endErrorContainer],
              flags: MessageFlags.IsComponentsV2,
            });
          });

        break;
      }

      case "reroll": {
        const rerollingContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# Giveaway Commands\n\n**Rerolling** your giveaway..`
            )
          );

        await interaction.reply({
          components: [rerollingContainer],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });

        const messageId = interaction.options.getString("message-id");

        client.giveawayManager
          .reroll(messageId)
          .then(() => {
            const rerollSuccessContainer = new ContainerBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `# Giveaway Commands\n\nYour **giveaway** has been **successfully** rerolled!`
                )
              );

            interaction.editReply({
              components: [rerollSuccessContainer],
              flags: MessageFlags.IsComponentsV2,
            });
          })
          .catch((err) => {
            const rerollErrorContainer = new ContainerBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `# Giveaway Commands\n\nAn **error** occurred!\n\n> **Error**: ${err.message}`
                )
              );

            interaction.editReply({
              components: [rerollErrorContainer],
              flags: MessageFlags.IsComponentsV2,
            });
          });

        break;
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
