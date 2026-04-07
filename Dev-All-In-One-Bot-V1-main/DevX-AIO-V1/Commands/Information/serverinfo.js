const {
    ChatInputCommandInteraction,
    ChannelType,
    GuildVerificationLevel,
    GuildExplicitContentFilter,
    GuildNSFWLevel,
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
  } = require("discord.js");
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("serverinfo")
      .setDescription("Displays information about the server."),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
      const { guild } = interaction;
      const { members, channels, emojis, roles, stickers } = guild;
  
      const sortedRoles = roles.cache
        .map((role) => role)
        .slice(1, roles.cache.size)
        .sort((a, b) => b.position - a.position);
      const userRoles = sortedRoles.filter((role) => !role.managed);
      const managedRoles = sortedRoles.filter((role) => role.managed);
      const botCount = members.cache.filter((member) => member.user.bot).size;
  
      const maxDisplayRoles = (roles, maxFieldLength = 1024) => {
        let totalLength = 0;
        const result = [];
  
        for (const role of roles) {
          const roleString = `<@&${role.id}>`;
  
          if (roleString.length + totalLength > maxFieldLength) break;
  
          totalLength += roleString.length + 1; // +1 as it's likely we want to display them with a space between each role, which counts towards the limit.
          result.push(roleString);
        }
  
        return result.length;
      };
  
      const splitPascal = (string, separator) =>
        string.split(/(?=[A-Z])/).join(separator);
      const toPascalCase = (string, separator = false) => {
        const pascal =
          string.charAt(0).toUpperCase() +
          string
            .slice(1)
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
        return separator ? splitPascal(pascal, separator) : pascal;
      };
  
      const getChannelTypeSize = (type) =>
        channels.cache.filter((channel) => type.includes(channel.type)).size;
  
      const totalChannels = getChannelTypeSize([
        ChannelType.GuildText,
        ChannelType.GuildNews,
        ChannelType.GuildVoice,
        ChannelType.GuildStageVoice,
        ChannelType.GuildForum,
        ChannelType.GuildPublicThread,
        ChannelType.GuildPrivateThread,
        ChannelType.GuildNewsThread,
        ChannelType.GuildCategory,
      ]);
  
      const container = new ContainerBuilder();
  
      // Title
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${guild.name}'s Information`)
      );
  
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
  
      // Description
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`📝 **Description:** ${guild.description || "None"}`)
      );
  
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
  
      // General Information
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**General**\n<:data:1423012461002362920> **Created** <t:${parseInt(
            guild.createdTimestamp / 1000
          )}:R>\n<:info:1423012481248268408> **ID** \`${guild.id}\`\n⚡ **Owner** <@${guild.ownerId}>\n<:lang:1423012510361059481> **Language** \`${new Intl.DisplayNames(
            ["en"],
            {
              type: "language",
            }
          ).of(guild.preferredLocale)}\`\n<:lock:1423012512269336707> **Vanity URL** ${
            guild.vanityURLCode || "None"
          }`
        )
      );
  
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
  
      // Features and Security
      const featuresText = guild.features
        ?.map((feature) => `- ${toPascalCase(feature, " ")}`)
        ?.join("\n") || "None";
  
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Features**\n${featuresText}\n\n**Security**\n<a:dott:1423012508565766254> **Explicit Filter** \`${splitPascal(
            GuildExplicitContentFilter[guild.explicitContentFilter],
            " "
          )}\`\n<a:dott:1423012508565766254> **NSFW Level** \`${splitPascal(
            GuildNSFWLevel[guild.nsfwLevel],
            " "
          )}\`\n<a:dott:1423012508565766254> **Verification Level** \`${splitPascal(
            GuildVerificationLevel[guild.verificationLevel],
            " "
          )}\``
        )
      );
  
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
  
      // Users
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Users (\`${guild.memberCount}\`)**\n<:members:1423012514232533143> **Members** \`${
            guild.memberCount - botCount
          }\`\n<:bot:1423012516123906211> **Bots** \`${botCount}\``
        )
      );
  
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
  
      // Roles
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**User Roles (${maxDisplayRoles(userRoles)} of ${userRoles.length})**\n${
            userRoles.slice(0, maxDisplayRoles(userRoles)).join(" ") || "None"
          }\n\n**Managed Roles (${maxDisplayRoles(managedRoles)} of ${managedRoles.length})**\n${
            managedRoles.slice(0, maxDisplayRoles(managedRoles)).join(" ") || "None"
          }`
        )
      );
  
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
  
      // Channels and Emojis
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Channels, Threads & Categories (${totalChannels})**\n<:threads:1423012518338760856> **Text** \`${getChannelTypeSize(
            [
              ChannelType.GuildText,
              ChannelType.GuildForum,
              ChannelType.GuildNews,
            ]
          )}\`\n<:vol:1423012520871989421> **Voice** \`${getChannelTypeSize([
            ChannelType.GuildVoice,
            ChannelType.GuildStageVoice,
          ])}\`\n<a:dott:1423012508565766254> **Threads** \`${getChannelTypeSize(
            [
              ChannelType.GuildPublicThread,
              ChannelType.GuildPrivateThread,
              ChannelType.GuildNewsThread,
            ]
          )}\`\n<a:dott:1423012508565766254> **Categories** \`${getChannelTypeSize(
            [ChannelType.GuildCategory]
          )}\`\n\n**Emojis & Stickers (${
            emojis.cache.size + stickers.cache.size
          })**\n<a:dott:1423012508565766254> **Animated** ${
            emojis.cache.filter((emoji) => emoji.animated).size
          }\n<a:dott:1423012508565766254> **Static** ${
            emojis.cache.filter((emoji) => !emoji.animated).size
          }\n<a:dott:1423012508565766254> **Stickers** ${stickers.cache.size}`
        )
      );
  
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
  
      // Nitro
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Nitro**\n<:extra:1423012523531046922> **Tier** ${
            guild.premiumTier || "None"
          }\n<:extra:1423012523531046922> **Boosts** ${guild.premiumSubscriptionCount}\n<:extra:1423012523531046922> **Boosters** ${
            guild.members.cache.filter(
              (member) => member.roles.premiumSubscriberRole
            ).size
          }\n<:extra:1423012523531046922> **Total Boosters** ${
            guild.members.cache.filter((member) => member.premiumSince).size
          }`
        )
      );
  
      // Banner
      if (guild.bannerURL({ size: 1024 })) {
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
  
        container.addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(guild.bannerURL({ size: 1024 }))
          )
        );
      }
  
      interaction.reply({
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
