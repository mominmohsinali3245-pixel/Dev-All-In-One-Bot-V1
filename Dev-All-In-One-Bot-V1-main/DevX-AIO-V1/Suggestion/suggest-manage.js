const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const Suggestions = require("../../Schemas/Suggestions");
const SuggestionSetup = require("../../Schemas/SuggestionSetup");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`suggest-manage`)
    .setDescription(`Manage a suggestion by accepting or declinding them`)
    .addStringOption((option) => {
      return option
        .setName(`action`)
        .setDescription(`Chose a specific action to use`)
        .setRequired(true)
        .addChoices(
          { name: `accept`, value: `accept` },
          { name: `decline`, value: `decline` },
          { name: `un-respond`, value: `un-respond` }
        );
    })
    .addStringOption((option) => {
      return option
        .setName(`message-id`)
        .setDescription(`Provide a suggestion message id`)
        .setRequired(true);
    }),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const { guild, channel, options, member } = interaction;
    const i = interaction;

    const messageId = options.getString("message-id");
    const action = options.getString("action");

    const SuggestionsDB = await Suggestions.findOne({
      GuildID: guild.id,
      ChannelID: channel.id,
      MessageID: messageId,
    });
    if (!SuggestionsDB)
      return i.reply({
        content: `> **Warning:** Couldn't find any data on this suggestion:/`,
        ephemeral: true,
      });

    const SuggestionSetupDB = await SuggestionSetup.findOne({
      GuildID: guild.id,
    });
    if (!SuggestionSetupDB)
      return i.reply({
        content: `> **Warning:** Couldn't find any data on this system:/`,
        ephemeral: true,
      });

    if (!member.roles.cache.find((r) => r.id === SuggestionSetupDB.ManagerRole))
      return interaction.reply({
        content: `> **Warning:** Your not allowed to use these actions!`,
        ephemeral: true,
      });

    const SuggestChannel = guild.channels.cache.get(
      SuggestionSetupDB.SuggestChannel
    );
    const SuggestMessage = await SuggestChannel.messages.fetch(
      SuggestionsDB.MessageID
    );

    const DisabledButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("Upvote")
        .setEmoji("⬆️")
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("Downvote")
        .setEmoji("⬇️")
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("Delete")
        .setEmoji("<:delete:1423012544523669647>")
        .setStyle(ButtonStyle.Danger)
    );

    const EnabledButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("Upvote")
        .setEmoji("⬆️")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("Downvote")
        .setEmoji("⬇️")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("Delete")
        .setEmoji("<:delete:1423012544523669647>")
        .setStyle(ButtonStyle.Danger)
    );

    switch (action) {
      case "accept":
        {
          if (SuggestionsDB.Accepted == true)
            return i.reply({
              content: `> **Warning:** This suggestion is already accepted`,
              ephemeral: true,
            });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Suggestion**:\n${SuggestionsDB.Suggestion}`
            )
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Upvotes**: \`\`\`${SuggestionsDB.Upvotes.length}\`\`\`\n**Downvotes**: \`\`\`${SuggestionsDB.Downvotes.length}\`\`\`\n**Status**: \`\`\`Accepted\`\`\``
            )
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `Accepted By ${member.user.tag} at <t:${Math.floor(Date.now() / 1000)}:F>`
            )
          );

          await SuggestMessage.edit({
            content: `<@${SuggestionsDB.MemberID}>`,
            components: [container, DisabledButtons],
            flags: MessageFlags.IsComponentsV2,
          });
          await Suggestions.findOneAndUpdate(
            { GuildID: guild.id, ChannelID: channel.id, MessageID: messageId },
            { Declined: false, Accepted: true }
          );
          i.reply({
            content: `> **Success:** You accepted the suggestion`,
            ephemeral: true,
          });
        }
        break;
      case "decline":
        {
          if (SuggestionsDB.Declined == true)
            return i.reply({
              content: `> **Warning:** This suggestion is already declined`,
              ephemeral: true,
            });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Suggestion**:\n${SuggestionsDB.Suggestion}`
            )
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Upvotes**: \`\`\`${SuggestionsDB.Upvotes.length}\`\`\`\n**Downvotes**: \`\`\`${SuggestionsDB.Downvotes.length}\`\`\`\n**Status**: \`\`\`Declined\`\`\``
            )
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `Declined By ${member.user.tag} at <t:${Math.floor(Date.now() / 1000)}:F>`
            )
          );

          await SuggestMessage.edit({
            content: `<@${SuggestionsDB.MemberID}>`,
            components: [container, DisabledButtons],
            flags: MessageFlags.IsComponentsV2,
          });
          await Suggestions.findOneAndUpdate(
            { GuildID: guild.id, ChannelID: channel.id, MessageID: messageId },
            { Declined: true, Accepted: false }
          );
          interaction.reply({
            content: `> **Success** You declined the suggestion`,
            ephemeral: true,
          });
        }
        break;
      case "un-respond":
        {
          if (SuggestionsDB.Accepted || SuggestionsDB.Declined == false)
            return i.reply({
              content: `> **Warning:** Suggestion isn't accepted or declined`,
              ephemeral: true,
            });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Suggestion**:\n${SuggestionsDB.Suggestion}`
            )
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Upvotes**: \`\`\`${SuggestionsDB.Upvotes.length}\`\`\`\n**Downvotes**: \`\`\`${SuggestionsDB.Downvotes.length}\`\`\`\n**Status**: \`\`\`Pending\`\`\``
            )
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `Suggestion started again at <t:${Math.floor(Date.now() / 1000)}:F>`
            )
          );

          await SuggestMessage.edit({
            content: `** **`,
            components: [container, EnabledButtons],
            flags: MessageFlags.IsComponentsV2,
          });
          await Suggestions.findOneAndUpdate(
            { GuildID: guild.id, ChannelID: channel.id, MessageID: messageId },
            { Declined: false, Accepted: false }
          );
          i.reply({
            content: `> **Success:** You started the suggestion again!`,
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
