
const {
  Events,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  SeparatorSpacingSize,
} = require("discord.js");

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return;
    
    // Check if bot is mentioned
    if (!message.mentions.has(client.user.id)) return;
    
    const container = new ContainerBuilder();
    
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# <:emoji_42:1423037835933651045> Hey there!\n\n<:dots:1423015515026100386> I'm **${client.user.username}** - Your advanced Discord companion\n<:dots:1423015515026100386> Use \`/help\` to explore all my commands\n<:dots:1423015515026100386> Need support? Join our [server](https://discord.gg/8wfT8SfB5Z)`
      )
    );
    
    container.addSeparatorComponents(new SeparatorBuilder());
    
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(
          "https://cdn.discordapp.com/attachments/1414256332592254986/1423014704586166385/standard.gif?ex=68dec537&is=68dd73b7&hm=44f2afa2fe3f8ec5e989c84661fa6b9942a2842ccc886c06aea1d757d2a184eb&"
        )
      )
    );
    
    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
    
    await message.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
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
