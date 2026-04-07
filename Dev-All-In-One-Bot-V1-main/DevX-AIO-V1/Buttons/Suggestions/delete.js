const { 
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
const Suggestions = require("../../Schemas/Suggestions");
const SuggestionSetup = require("../../Schemas/SuggestionSetup");

module.exports = {
  id: "Delete",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { channel, guild, member, message } = interaction;
    const i = interaction;
    const SuggestionsDB = await Suggestions.findOne({
      GuildID: guild.id,
      ChannelID: channel.id,
      MessageID: message.id,
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
      return i.reply({
        content: `> **Warning:** Your not allowed to use this button:/`,
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
        `**Upvotes**: \`\`\`${SuggestionsDB.Upvotes.length}\`\`\`\n**Downvotes**: \`\`\`${SuggestionsDB.Downvotes.length}\`\`\`\n**Status**: \`\`\`Deleted\`\`\``
      )
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Suggestion from ${SuggestionsDB.MemberTag}`
      )
    );

    await Suggestions.findOneAndDelete(
      {
        GuildID: guild.id,
        ChannelID: channel.id,
        MessageID: message.id,
      },
      { GuildID: guild.id }
    );

    message.edit({ 
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    i.reply({
      content: `> **Success:** You deleted the suggestion!`,
      ephemeral: true,
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
