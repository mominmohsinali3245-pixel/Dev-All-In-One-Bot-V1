
const { 
  SlashCommandBuilder, 
  ContainerBuilder, 
  TextDisplayBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
  SeparatorSpacingSize
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("developer")
    .setDescription("Shows information about the bot developers"),
  
  async execute(interaction, client) {
    const container = new ContainerBuilder();

    // Developer title
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# 👨‍💻 Bot Developer`
      )
    );

    // Divider separator
    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

    // Developer info
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `<:dots:1423015515026100386> **Developer:** [𝐀 𝐞 𝐠 𝐢 𝐬](https://discord.com/users/1124248109472550993)\nA passionate developer dedicated to creating innovative Discord experiences.\nFrom concept to deployment, bringing ideas to life with precision and care.`
      )
    );

    // Separator
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    // Technologies
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Technologies**\n<:reply_1:1423012467952586923> Discord.js v14\n<:reply_1:1423012467952586923> Node.js\n<:reply_1:1423012467952586923> MongoDB\n<:reply_1:1423012467952586923> Canvas API`
      )
    );

    // Separator
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    // Add gif (same as help.js)
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL("https://cdn.discordapp.com/attachments/1414256332592254986/1423014704586166385/standard.gif?ex=68dec537&is=68dd73b7&hm=44f2afa2fe3f8ec5e989c84661fa6b9942a2842ccc886c06aea1d757d2a184eb&")
      )
    );

    // Divider separator
    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

    // Footer text
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `*Developed with ❤️ by AeroX Development*`
      )
    );

    // Separator
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    // Buttons
    container.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=303600576574&scope=bot%20applications.commands`)
          .setLabel(`Invite Bot`)
          .setStyle(ButtonStyle.Link),

        new ButtonBuilder()
          .setURL(`https://discord.gg/aerox`)
          .setLabel(`AeroX Development`)
          .setStyle(ButtonStyle.Link)
      )
    );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }
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
