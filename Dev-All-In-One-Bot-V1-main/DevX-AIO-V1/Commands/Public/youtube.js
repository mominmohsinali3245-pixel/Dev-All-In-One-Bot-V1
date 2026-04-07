
const {
  SlashCommandBuilder,
  PermissionsBitField,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  ChannelType,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("youtube")
    .setDescription(`Get YouTube channel information and latest videos.`)
    .addSubcommand(subcommand =>
      subcommand.setName('latestvideo')
        .setDescription(`Get the latest video from a channel.`)
        .addStringOption(option =>
          option.setName(`link`)
            .setDescription(`The link of the channel you want to see the latest video of.`)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('info')
        .setDescription(`Get information about the channel`)
        .addStringOption(option =>
          option.setName(`link`)
            .setDescription(`The link of the channel you want to see info of.`)
            .setRequired(true)
        )
    ),

  async execute(interaction, client) {
    if (!client.ytp) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("# ❌ YouTube Functionality Unavailable\n\nYouTube functionality is currently unavailable. Please contact the bot administrator.")
      );
      return interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        ephemeral: true
      });
    }

    const { options, guildId } = interaction;
    const sub = options.getSubcommand();
    const link = options.getString('link');
    const channel = options.getChannel('channel') || interaction.channel;

    try {
      switch (sub) {
        case "latestvideo":
          await interaction.deferReply();
          
          try {
            const videoData = await client.ytp.getLatestVideos(link);
            if (!videoData || videoData.length === 0) {
              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent("# ❌ No Videos Found\n\nCouldn't find any videos for this channel.")
              );
              return interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
              });
            }

            const video = videoData[0];
            const videoContainer = new ContainerBuilder();

            videoContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# 📺 Latest Video\n\n**${video.title}**`)
            );

            // Construct thumbnail URL from video ID
            if (video.id) {
              // Extract actual video ID from format like "yt:video:VIDEO_ID"
              const videoId = video.id.includes(':') ? video.id.split(':').pop() : video.id;
              // Use hqdefault.jpg for better compatibility (maxresdefault.jpg not always available)
              const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
              videoContainer.addSeparatorComponents(new SeparatorBuilder());
              videoContainer.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                  new MediaGalleryItemBuilder()
                    .setURL(thumbnailUrl)
                    .setDescription(video.title || 'Video Thumbnail')
                )
              );
            }

            videoContainer.addSeparatorComponents(new SeparatorBuilder());

            videoContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`**Video Link**\n${video.link}`)
            );
            videoContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            videoContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`**Published**\n${video.pubDate || 'Recently'}`)
            );

            if (video.author) {
              videoContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
              videoContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Channel**\n${video.author}`)
              );
            }

            await interaction.editReply({
              components: [videoContainer],
              flags: MessageFlags.IsComponentsV2
            });
          } catch (error) {
            console.error('Error fetching latest video:', error);
            const errorContainer = new ContainerBuilder();
            errorContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# ❌ Error\n\nFailed to fetch the latest video. Please verify the channel link is correct.\n\n**Error:** \`${error.message || error}\``)
            );
            await interaction.editReply({
              components: [errorContainer],
              flags: MessageFlags.IsComponentsV2
            });
          }
          break;

        case "info":
          await interaction.deferReply();
          
          try {
            const channelData = await client.ytp.getChannelInfo(link);

            const infoContainer = new ContainerBuilder();

            infoContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# 📺 ${channelData.name || 'YouTube Channel'}`)
            );

            infoContainer.addSeparatorComponents(new SeparatorBuilder());

            infoContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`**Channel URL**\n${channelData.url || link}`)
            );
            infoContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            infoContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`**Channel ID**\n\`${channelData.id || 'Unknown'}\``)
            );

            if (channelData.subscribers) {
              infoContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
              infoContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Subscribers**\n${channelData.subscribers}`)
              );
            }

            if (channelData.description) {
              infoContainer.addSeparatorComponents(new SeparatorBuilder());
              const desc = channelData.description.length > 500
                ? channelData.description.substring(0, 500) + '...'
                : channelData.description;
              infoContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Description**\n${desc}`)
              );
            }

            if (channelData.banner && channelData.banner[0] && channelData.banner[0].url) {
              infoContainer.addSeparatorComponents(new SeparatorBuilder());
              infoContainer.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                  new MediaGalleryItemBuilder()
                    .setURL(channelData.banner[0].url)
                    .setDescription('Channel Banner')
                )
              );
            }

            infoContainer.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

            infoContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`**Family Safe:** ${channelData.familySafe ? 'Yes ✅' : 'No ❌'} | **Unlisted:** ${channelData.unlisted ? 'Yes' : 'No'}`)
            );

            await interaction.editReply({
              components: [infoContainer],
              flags: MessageFlags.IsComponentsV2
            });
          } catch (error) {
            console.error('Error fetching channel info:', error);
            const errorContainer = new ContainerBuilder();
            errorContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# ❌ Error\n\nFailed to fetch channel information. Please verify the channel link is correct.\n\n**Error:** \`${error.message || error}\``)
            );
            await interaction.editReply({
              components: [errorContainer],
              flags: MessageFlags.IsComponentsV2
            });
          }
          break;
      }
    } catch (err) {
      console.log(err);
      const errorContainer = new ContainerBuilder();
      errorContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ❌ Error\n\n\`\`\`yaml\n${err.message || err}\`\`\`\n\nSomething went wrong, please contact developers.`)
      );
      return interaction.reply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
        ephemeral: true
      });
    }
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
