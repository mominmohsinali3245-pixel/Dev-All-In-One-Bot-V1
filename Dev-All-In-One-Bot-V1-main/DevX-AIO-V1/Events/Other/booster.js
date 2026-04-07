const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

const boosterSchema = require("../../Schemas/boosterSchema");

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember, client) {
    const boosterdata = await boosterSchema.findOne({ Guild: client.guild.id });

    if (!boosterdata) return;

    const boostAnnounceChannel = client.channels.cache.get(
      boosterdata.Channel1
    );

    const boostAnnouceLogChannel = client.channels.cache.get(
      boosterdata.Channel2
    );

    const format = {
      0: "No Level",
      1: "Level 1",
      2: "Level 2",
      3: "Level 3",
    };

    const boostLevel = format[newMember.guild.premiumTier];

    if (!oldMember.roles.cache.size !== newMember.roles.cache.size) {
      if (
        !oldMember.roles.cache.has(
          newMember.guild.roles.premiumSubscriberRole.id
        ) &&
        newMember.roles.cache.has(
          newMember.guild.roles.premiumSubscriberRole.id
        )
      ) {
        const boostAnnounceContainer = new ContainerBuilder();
        
        boostAnnounceContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# 🎉🎉 BOOSTER PARTY 🎉🎉\n\n<@${newMember.user.id}>, You Are Awsome And Amazing.\n\nThanks For Boost The Server\nEnjoy Your ${newMember.guild.roles.premiumSubscriberRole} and Other Exclusive Perks!`
          )
        );

        boostAnnounceContainer.addSeparatorComponents(new SeparatorBuilder());

        boostAnnounceContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**💎 Total Boost:**\n${newMember.guild.premiumSubscriptionCount} Boost | ${boostLevel}`
          )
        );

        boostAnnounceContainer.addSeparatorComponents(new SeparatorBuilder());

        boostAnnounceContainer.addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL("https://tenor.com/view/discord-banner-boost-gif-22451991")
          )
        );

        boostAnnounceContainer.addSeparatorComponents(new SeparatorBuilder());

        boostAnnounceContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${newMember.guild.name} Boost Detection System`
          )
        );

        const boostAnnounceRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel(`${newMember.user.tag}`)
            .setCustomId("BoostDetection")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true)
        );

        const msg = await boostAnnounceChannel.send({
          content: `${newMember} \`<@${newMember.user.id}>\``,
          components: [boostAnnounceContainer, boostAnnounceRow],
          flags: MessageFlags.IsComponentsV2,
        });
        msg.react("🎉");

        newMember.send({
          content: `Hello ${newMember.user.tag} You are Awesome, Thanks For Boost The **__${newMember.guild.name}__** Server\nSo Enjoy Your **${newMember.guild.roles.premiumSubscriberRole.name}** Role And Other Massive Perks🎉`,
          components: [boostAnnounceRow],
        });

        const boostLogContainer = new ContainerBuilder();
        
        boostLogContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# NEW Boost Detection System`
          )
        );

        boostLogContainer.addSeparatorComponents(new SeparatorBuilder());

        boostLogContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**💎 Nitro Booster**\n${newMember.user} | ${newMember.user.tag}\n\n**🎉 Server Boost at:**\n<t:${Math.round(newMember.premiumSinceTimestamp / 1000)}:f> | <t:${Math.round(newMember.premiumSinceTimestamp / 1000)}:R>\n\n**⏰ Account Created at:**\n<t:${Math.round(newMember.user.createdTimestamp / 1000)}:f> | <t:${Math.round(newMember.user.createdTimestamp / 1000)}:R>\n\n**📆 Joined Server at:**\n<t:${Math.round(newMember.joinedTimestamp / 1000)}:f> | <t:${Math.round(newMember.joinedTimestamp / 1000)}:R>`
          )
        );

        boostLogContainer.addSeparatorComponents(new SeparatorBuilder());

        boostLogContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**💜 Total Boost**\n${newMember.guild.premiumSubscriptionCount} Boost | ${boostLevel}\n\n**✅ Assigned Role:**\n${newMember.guild.roles.premiumSubscriberRole} | ${newMember.guild.roles.premiumSubscriberRole.name} | ${newMember.guild.roles.premiumSubscriberRole.id}`
          )
        );

        boostLogContainer.addSeparatorComponents(new SeparatorBuilder());

        boostLogContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `ID: ${newMember.user.id} (All Action Were Passed)`
          )
        );

        const boostLogMessage = await boostAnnouceLogChannel.send({
          components: [boostLogContainer],
          flags: MessageFlags.IsComponentsV2,
        });

        boostLogMessage.pin();
      }
    }

    if (
      oldMember.roles.cache.has(
        oldMember.guild.roles.premiumSubscriberRole.id
      ) &&
      !newMember.roles.cache.has(oldMember.guild.roles.premiumSubscriberRole.id)
    ) {
      const unboostContainer = new ContainerBuilder();
      
      unboostContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# NEW UnBoost or Expired Detection System`
        )
      );

      unboostContainer.addSeparatorComponents(new SeparatorBuilder());

      unboostContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**📌 UnBooster:**\n${oldMember.user} | ${oldMember.user.tag}\n\n**⏰ Account Created at:**\n<t:${Math.round(oldMember.user.createdTimestamp / 1000)}:f> | <t:${Math.round(oldMember.user.createdTimestamp / 1000)}:R>\n\n**📆 Joined Server at:**\n<t:${Math.round(oldMember.joinedTimestamp / 1000)}:f> | <t:${Math.round(oldMember.joinedTimestamp / 1000)}:R>`
        )
      );

      unboostContainer.addSeparatorComponents(new SeparatorBuilder());

      unboostContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**💜 Total Boost:**\n${oldMember.guild.premiumSubscriptionCount} Boost | ${boostLevel}\n\n**❌ Removed Role:**\n${oldMember.guild.roles.premiumSubscriberRole} | ${oldMember.guild.roles.premiumSubscriberRole.name} | ${oldMember.guild.roles.premiumSubscriberRole.id}`
        )
      );

      unboostContainer.addSeparatorComponents(new SeparatorBuilder());

      unboostContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `ID: ${oldMember.user.id}`
        )
      );

      const unboostLogMessage = await boostAnnouceLogChannel.send({
        components: [unboostContainer],
        flags: MessageFlags.IsComponentsV2,
      });

      unboostLogMessage.pin();

      oldMember.send({
        content: `> **Message Form Boost Detection System**\n\n> Hello ${oldMember.user.tag}, Unfortunately Your Nitro Boost For **__${oldMember.guild.name}__** Server Has Been Expired And You Lose Your Special And Cool Perks And Exclusive **${oldMember.guild.roles.premiumSubscriberRole.name}** Role :'(\n\n> 🎉By Boosting Again You Can Get This Perks Back!`,
      });
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
