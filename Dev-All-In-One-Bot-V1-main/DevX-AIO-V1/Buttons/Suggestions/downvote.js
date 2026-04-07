const { 
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const Suggestions = require("../../Schemas/Suggestions");
const SuggestionSetup = require("../../Schemas/SuggestionSetup");

module.exports = {
  id: "Downvote",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const SuggestionsDB = await Suggestions.findOne({
      GuildID: interaction.guild.id,
      ChannelID: interaction.channel.id,
      MessageID: interaction.message.id,
    });
    if (!SuggestionsDB)
      return interaction.reply({
        content: `> **Warning:** Couldn't find any data on this suggestion:/`,
        ephemeral: true,
      });

    const SuggestionSetupDB = await SuggestionSetup.findOne({
      GuildID: interaction.guild.id,
    });
    if (!SuggestionSetupDB)
      return interaction.reply({
        content: `> **Warning:** Couldn't find any data on this system:/`,
        ephemeral: true,
      });

    if (SuggestionsDB.Upvotes.includes(interaction.user.id))
      return interaction.reply({
        content: `> **Alert:** Please remove your upvote first, before downvoting`,
        ephemeral: true,
      });

    if (SuggestionsDB.Downvotes.includes(interaction.user.id)) {
      await Suggestions.findOneAndUpdate(
        {
          GuildID: interaction.guild.id,
          ChannelID: interaction.channel.id,
          MessageID: interaction.message.id,
        },
        { $pull: { Downvotes: interaction.user.id } }
      );

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Suggestion**:\n${SuggestionsDB.Suggestion}`
        )
      );
      container.addSeparatorComponents(new SeparatorBuilder());
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Upvotes**: \`\`\`${SuggestionsDB.Upvotes.length}\`\`\`\n**Downvotes**: \`\`\`${SuggestionsDB.Downvotes.length - 1}\`\`\`\n**Status**: \`\`\`Pending\`\`\``
        )
      );
      container.addSeparatorComponents(new SeparatorBuilder());
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Suggestion from ${SuggestionsDB.MemberTag}`
        )
      );

      interaction.message.edit({ 
        components: [
          container,
          new ActionRowBuilder().addComponents([
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
              .setStyle(ButtonStyle.Danger),
          ]),
        ],
        flags: MessageFlags.IsComponentsV2,
      });

      return interaction.reply({
        content: `> **Success:** You removed your vote!`,
        ephemeral: true,
      });
    }
    await Suggestions.findOneAndUpdate(
      {
        GuildID: interaction.guild.id,
        ChannelID: interaction.channel.id,
        MessageID: interaction.message.id,
      },
      { $push: { Downvotes: interaction.user.id } }
    ).then(() => {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Suggestion**:\n${SuggestionsDB.Suggestion}`
        )
      );
      container.addSeparatorComponents(new SeparatorBuilder());
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Upvotes**: \`\`\`${SuggestionsDB.Upvotes.length}\`\`\`\n**Downvotes**: \`\`\`${SuggestionsDB.Downvotes.length + 1}\`\`\`\n**Status**: \`\`\`Pending\`\`\``
        )
      );
      container.addSeparatorComponents(new SeparatorBuilder());
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Suggestion from ${SuggestionsDB.MemberTag}`
        )
      );

      interaction.message.edit({ 
        components: [
          container,
          new ActionRowBuilder().addComponents([
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
              .setStyle(ButtonStyle.Danger),
          ]),
        ],
        flags: MessageFlags.IsComponentsV2,
      });

      return interaction.reply({
        content: `> **Success:** You added your vote!`,
        ephemeral: true,
      });
    });
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
