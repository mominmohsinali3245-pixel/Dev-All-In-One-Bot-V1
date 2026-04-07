const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  CommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const Suggestions = require("../../Schemas/Suggestions");
const SuggestionSetup = require("../../Schemas/SuggestionSetup");

module.exports = {
  id: "suggestModal",
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member } = interaction;

    const SuggestionSetupDB = await SuggestionSetup.findOne({
      GuildID: interaction.guild.id,
    });
    if (!SuggestionSetupDB)
      return interaction.reply({
        content: `> **Warning:** Couldn't find any data on this system:/`,
        ephemeral: true,
      });

    const input = interaction.fields.getTextInputValue("suggest_Modal");

    const container = new ContainerBuilder();
    
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Suggestion**:\n${input}`
      )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Upvotes**: \`\`\`0\`\`\`\n**Downvotes**: \`\`\`0\`\`\`\n**Status**: \`\`\`Pending\`\`\``
      )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Suggestion from ${member.user.tag}`
      )
    );

    await guild.channels.cache
      .get(SuggestionSetupDB.SuggestChannel)
      .send({
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
      })
      .then(async (Message) => {
        await interaction.reply({
          content: `> **Success:** Your suggestion has been sent in <#${SuggestionSetupDB.SuggestChannel}>!`,
          ephemeral: true,
        });
        await Suggestions.create({
          GuildID: guild.id,
          ChannelID: SuggestionSetupDB.SuggestChannel,
          MessageID: Message.id,
          MemberID: member.id,
          MemberTag: member.user.tag,
          Suggestion: input,
          Accepted: false,
          Declined: false,
          Upvotes: [],
          Downvotes: [],
        }).catch((err) => console.log(err));
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
