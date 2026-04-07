
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  SeparatorSpacingSize,
} = require("discord.js");

function handleLogs(client) {
  const logSchema = require("../../Schemas/logschema");

  function send_log(guildId, container) {
    logSchema.findOne({ Guild: guildId }, async (err, data) => {
      if (!data || !data.Channel) return;
      const LogChannel = client.channels.cache.get(data.Channel);

      if (!LogChannel) return;

      try {
        LogChannel.send({ 
          components: [container],
          flags: MessageFlags.IsComponentsV2
        });
      } catch (err) {
        console.log("Error sending log!");
      }
    });
  }

  client.on("channelUpdate", async (oldChannel, newChannel) => {
    if (!oldChannel.permissionOverwrites || !newChannel.permissionOverwrites) return;

    const oldPerms = oldChannel.permissionOverwrites.cache;
    const newPerms = newChannel.permissionOverwrites.cache;

    const permsChanged = !oldPerms.equals(newPerms);
    const nameChanged = oldChannel.name !== newChannel.name;

    if (!permsChanged && !nameChanged) return;

    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🚧 Channel Updated`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Channel:** ${newChannel}\n**Changes:** ${permsChanged ? "Permissions" : ""} ${nameChanged ? "Name" : ""} were updated`
      )
    );

    return send_log(newChannel.guild.id, container);
  });

  client.on("guildChannelTopicUpdate", (channel, oldTopic, newTopic) => {
    try {
      if (channel.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Topic Changed`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Channel:** ${channel}\n**Old Topic:** ${oldTopic}\n**New Topic:** ${newTopic}`
        )
      );

      return send_log(channel.guild.id, container);
    } catch (err) {
      console.log("Err logging topic update");
    }
  });

  client.on(
    "guildChannelPermissionsUpdate",
    (channel, oldPermissions, newPermissions) => {
      try {
        if (channel.guild === null) return;

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# 🚧 Channel Updated`)
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Channel:** ${channel}\n**Changes:** Channel's permissions/name were updated`
          )
        );

        return send_log(channel.guild.id, container);
      } catch (err) {
        console.log("Err logging channel update");
      }
    }
  );

  client.on("unhandledGuildChannelUpdate", (oldChannel, newChannel) => {
    try {
      if (oldChannel.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Channel Updated`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Channel:** ${oldChannel}\n**Changes:** **PixelVal** couldn't find any changes!`
        )
      );

      return send_log(oldChannel.guild.id, container);
    } catch (err) {
      console.log("Err logging unhandled channel update");
    }
  });

  client.on("guildMemberBoost", (member) => {
    try {
      if (member.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 ${member.user.username} started Boosting`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${member.user}\n**Server:** ${member.guild.name}`
        )
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging member boost start");
    }
  });

  client.on("guildMemberUnboost", (member) => {
    try {
      if (member.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 ${member.user.username} stopped Boosting`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${member.user}\n**Server:** ${member.guild.name}`
        )
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging member boost stop");
    }
  });

  client.on("guildMemberRoleAdd", (member, role) => {
    try {
      if (member.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 ${member.user.username} was given a Role`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${member.user}\n**Role:** ${role}`
        )
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging role give");
    }
  });

  client.on("guildMemberRoleRemove", (member, role) => {
    try {
      if (member.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 ${member.user.username} lost a Role`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${member.user}\n**Role:** ${role}`
        )
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging role remove");
    }
  });

  client.on("guildMemberNicknameUpdate", (member, oldNickname, newNickname) => {
    try {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Nickname Updated`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${member.user}\n**Old Nickname:** ${oldNickname || "**None**"}\n**New Nickname:** ${newNickname || "**None**"}`
        )
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging nick update");
    }
  });

  client.on("guildMemberAdd", (member) => {
    try {
      if (member.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 User Joined`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${member.user}\n**Member ID:** ${member.user.id}\n**Member Tag:** ${member.user.tag}`
        )
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging member add");
    }
  });

  client.on("guildMemberRemove", (member) => {
    try {
      if (member.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 User Left`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${member.user}\n**Member ID:** ${member.user.id}\n**Member Tag:** ${member.user.tag}`
        )
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging member leave");
    }
  });

  client.on("guildBoostLevelUp", (guild, oldLevel, newLevel) => {
    try {
      if (guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 ${guild.name} advanced a Boosting Level`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Info:** **${guild.name}** advanced from level **${oldLevel}** to **${newLevel}**!`
        )
      );

      return send_log(guild.id, container);
    } catch (err) {
      console.log("Err logging boost level up");
    }
  });

  client.on("guildBoostLevelDown", (guild, oldLevel, newLevel) => {
    try {
      if (guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 ${guild.name} lost a Boosting Level`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Info:** **${guild.name}** lost a level, from **${oldLevel}** to **${newLevel}**!`
        )
      );

      return send_log(guild.id, container);
    } catch (err) {
      console.log("Err logging level down");
    }
  });

  client.on("guildBannerAdd", (guild, bannerURL) => {
    try {
      if (guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 ${guild.name}'s Banner was Updated`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Banner URL:** ${bannerURL}`)
      );

      return send_log(guild.id, container);
    } catch (err) {
      console.log("Err logging banner change");
    }
  });

  client.on("guildAfkChannelAdd", (guild, afkChannel) => {
    try {
      if (guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 AFK channel Added`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**AFK Channel:** ${afkChannel}`)
      );

      return send_log(guild.id, container);
    } catch (err) {
      console.log("Err logging afk channel add");
    }
  });

  client.on("guildVanityURLAdd", (guild, vanityURL) => {
    try {
      if (guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Vanity URL Added`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Vanity URL:** ${vanityURL}`)
      );

      return send_log(guild.id, container);
    } catch (err) {
      console.log("Err logging vanity add");
    }
  });

  client.on("guildVanityURLRemove", (guild, vanityURL) => {
    try {
      if (guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Vanity URL Removed`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Old Vanity:** ${vanityURL}`)
      );

      return send_log(guild.id, container);
    } catch (err) {
      console.log("Err logging vanity remove");
    }
  });

  client.on("guildVanityURLUpdate", (guild, oldVanityURL, newVanityURL) => {
    try {
      if (guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Vanity URL Updated`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Old Vanity:** ${oldVanityURL}\n**New Vanity:** ${newVanityURL}`
        )
      );

      return send_log(guild.id, container);
    } catch (err) {
      console.log("Err logging vanity update");
    }
  });

  client.on("messagePinned", (message) => {
    try {
      if (message.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Message Pinned`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Pinner:** ${message.author}\n**Message:** ${message.content}`
        )
      );

      return send_log(message.guild.id, container);
    } catch (err) {
      console.log("Err logging pin add");
    }
  });

  client.on("messageContentEdited", (message, oldContent, newContent) => {
    try {
      if (message.guild === null) return;
      if (message.author.bot) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Message Edited`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${message.author}\n**Old Message:** ${oldContent}\n**New Message:** ${newContent}`
        )
      );

      return send_log(message.guild.id, container);
    } catch (err) {
      console.log("Err logging message edit");
    }
  });

  client.on("rolePositionUpdate", (role, oldPosition, newPosition) => {
    try {
      if (role.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Role position Updated`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Role:** ${role}\n**Old Position:** ${oldPosition}\n**New Position:** ${newPosition}`
        )
      );

      return send_log(role.guild.id, container);
    } catch (err) {
      console.log("Err logging role pos update");
    }
  });

  client.on("rolePermissionsUpdate", (role, oldPermissions, newPermissions) => {
    try {
      if (role.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Role permissions Updated`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Role:** ${role}\n**Old Permissions:** ${oldPermissions}\n**New Permissions:** ${newPermissions}`
        )
      );

      return send_log(role.guild.id, container);
    } catch (err) {
      console.log("Err logging role perms update");
    }
  });

  client.on("voiceChannelSwitch", (member, oldChannel, newChannel) => {
    try {
      if (member.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Voice channel Switched`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${member.user}\n**From:** ${oldChannel}\n**To:** ${newChannel}`
        )
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging vc switch");
    }
  });

  client.on("roleCreate", (role) => {
    try {
      if (role.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Role Created`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Role Name:** ${role.name}\n**Role ID:** ${role.id}\n**Role HEX:** ${role.hexColor}\n**Role Pos:** ${role.position}`
        )
      );

      return send_log(role.guild.id, container);
    } catch (err) {
      console.log("Err logging role create");
    }
  });

  client.on("roleDelete", (role) => {
    try {
      if (role.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Role Deleted`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Role Name:** ${role.name}`)
      );

      return send_log(role.guild.id, container);
    } catch (err) {
      console.log("Err logging role delete");
    }
  });

  client.on("guildBanAdd", ({ guild, user }) => {
    try {
      if (guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 User Banned`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${user}\n**Member ID:** ${user.id}\n**Member Tag:** ${user.tag}`
        )
      );

      return send_log(guild.id, container);
    } catch (err) {
      console.log("Err logging ban add");
    }
  });

  client.on("guildBanRemove", ({ guild, user }) => {
    try {
      if (guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 User Unbanned`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Member:** ${user}`)
      );

      return send_log(guild.id, container);
    } catch (err) {
      console.log("Err logging ban remove");
    }
  });

  client.on("channelCreate", (channel) => {
    try {
      if (channel.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Channel Created`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Channel:** ${channel}`)
      );

      return send_log(channel.guild.id, container);
    } catch (err) {
      console.log("Err logging channel create");
    }
  });

  client.on("channelDelete", (channel) => {
    try {
      if (channel.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Channel Deleted`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Channel:** ${channel}`)
      );

      return send_log(channel.guild.id, container);
    } catch (err) {
      console.log("Err logging channel delete");
    }
  });

  client.on("emojiCreate", (emoji) => {
    try {
      if (emoji.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Emoji Created`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Emoji:** ${emoji}\n**Emoji Name:** ${emoji.name}\n**Emoji ID:** ${emoji.id}`
        )
      );

      return send_log(emoji.guild.id, container);
    } catch (err) {
      console.log("Err logging emoji create");
    }
  });

  client.on("emojiDelete", (emoji) => {
    try {
      if (emoji.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Emoji Deleted`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Emoji Name:** ${emoji.name}\n**Emoji ID:** ${emoji.id}`
        )
      );

      return send_log(emoji.guild.id, container);
    } catch (err) {
      console.log("Err logging emoji delete");
    }
  });

  client.on("emojiUpdate", (oldEmoji, newEmoji) => {
    try {
      if (oldEmoji.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Emoji Updated`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Old Emoji:** ${oldEmoji.name}\n**New Emoji:** ${newEmoji.name}`
        )
      );

      return send_log(oldEmoji.guild.id, container);
    } catch (err) {
      console.log("Err logging emoji update");
    }
  });

  client.on("stickerCreate", (sticker) => {
    try {
      if (sticker.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Sticker Created`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Sticker:** ${sticker}\n**Sticker Name:** ${sticker.name}\n**Sticker ID:** ${sticker.id}`
        )
      );

      return send_log(sticker.guild.id, container);
    } catch (err) {
      console.log("Err logging sticker create");
    }
  });

  client.on("stickerDelete", (sticker) => {
    try {
      if (sticker.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Sticker Deleted`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Sticker Name:** ${sticker.name}\n**Sticker ID:** ${sticker.id}`
        )
      );

      return send_log(sticker.guild.id, container);
    } catch (err) {
      console.log("Err logging sticker delete");
    }
  });

  client.on("stickerUpdate", (oldSticker, newSticker) => {
    try {
      if (oldSticker.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Sticker Updated`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Old Sticker:** ${oldSticker.name}\n**New Sticker:** ${newSticker.name}`
        )
      );

      return send_log(oldSticker.guild.id, container);
    } catch (err) {
      console.log("Err logging sticker update");
    }
  });

  client.on("webhookUpdate", (channel) => {
    try {
      if (channel.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Webhook Updated`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Channel:** ${channel}`)
      );

      return send_log(channel.guild.id, container);
    } catch (err) {
      console.log("Err logging webhook update");
    }
  });

  client.on("guildUpdate", (oldGuild, newGuild) => {
    try {
      if (oldGuild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Server Updated`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Server:** ${newGuild.name}\n**Changes:** Server settings were updated`
        )
      );

      return send_log(oldGuild.id, container);
    } catch (err) {
      console.log("Err logging guild update");
    }
  });

  client.on("voiceChannelJoin", (member, channel) => {
    try {
      if (member.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Voice Channel Join`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${member.user}\n**Channel:** ${channel}`
        )
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging vc join");
    }
  });

  client.on("voiceChannelLeave", (member, channel) => {
    try {
      if (member.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Voice Channel Leave`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${member.user}\n**Channel:** ${channel}`
        )
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging vc leave");
    }
  });

  client.on("voiceChannelMute", (member, muteType) => {
    try {
      if (member.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Voice Channel Mute`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${member.user}\n**Mute Type:** ${muteType}`
        )
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging vc mute");
    }
  });

  client.on("voiceChannelUnmute", (member, oldMuteType) => {
    try {
      if (member.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Voice Channel Unmute`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Member:** ${member.user}`)
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging vc unmute");
    }
  });

  client.on("voiceChannelDeaf", (member, deafType) => {
    try {
      if (member.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Voice Channel Deaf`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${member.user}\n**Deaf Type:** ${deafType}`
        )
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging vc deaf");
    }
  });

  client.on("voiceChannelUndeaf", (member, oldDeafType) => {
    try {
      if (member.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Voice Channel Undeaf`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Member:** ${member.user}`)
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging vc undeaf");
    }
  });

  client.on("voiceStreamingStart", (member, voiceChannel) => {
    try {
      if (member.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Voice Streaming Started`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${member.user}\n**Channel:** ${voiceChannel}`
        )
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging stream start");
    }
  });

  client.on("voiceStreamingStop", (member, voiceChannel) => {
    try {
      if (member.guild === null) return;

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🚧 Voice Streaming Stopped`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Member:** ${member.user}\n**Channel:** ${voiceChannel}`
        )
      );

      return send_log(member.guild.id, container);
    } catch (err) {
      console.log("Err logging stream stop");
    }
  });
}

module.exports = handleLogs;

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
