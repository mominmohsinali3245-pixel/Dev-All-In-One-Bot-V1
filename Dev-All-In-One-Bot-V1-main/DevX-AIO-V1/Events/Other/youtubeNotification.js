
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SeparatorSpacingSize,
} = require('discord.js');

module.exports = {
  name: 'youtubeNotification',
  once: false,

  async execute(client) {
    if (!client.ytp) return;

    client.ytp.on('video', async (data) => {
      try {
        const { video, channelData } = data;
        const channel = await client.channels.fetch(channelData.discordChannel).catch(() => null);

        if (!channel) return;

        const container = new ContainerBuilder();

        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# 🎉 New Video Upload!\n\n**${channelData.YTchannel}** just uploaded a new video!`)
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${video.title}`)
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Video Link**\n${video.link}`)
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Published**\n${video.pubDate || 'Just now'}`)
        );

        if (video.thumbnail) {
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL(video.thumbnail)
                .setDescription(video.title)
            )
          );
        }

        if (video.description) {
          container.addSeparatorComponents(new SeparatorBuilder());
          const desc = video.description.length > 300
            ? video.description.substring(0, 300) + '...'
            : video.description;
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**Description**\n${desc}`)
          );
        }

        container.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`📺 Watch now: ${video.link}`)
        );

        await channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
          content: `@everyone New video from **${channelData.YTchannel}**!`
        });

      } catch (error) {
        console.error('Error sending YouTube notification:', error);
      }
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
