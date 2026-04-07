const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  StringSelectMenuBuilder,
} = require("discord.js");

const ytverifySchema = require("../../Schemas/ytverifySchema");
const { extractTextFromImage } = require("../../Utils/ocrUtils");

// Unicode emojis for the interface
const EMOJIS = {
  tick: "✅",
  cross: "❌",
  loading: "⏳",
  warning: "⚠️",
  success: "🎉",
  youtube: "📺",
  shield: "🛡️",
  settings: "⚙️",
  channel: "📝",
  role: "👤",
  info: "ℹ️",
};

/**
 * Create a standardized container message
 * @param {string} description - Container description
 * @returns {ContainerBuilder}
 */
function createContainer(description) {
  const container = new ContainerBuilder();
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(description)
  );
  return container;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ytverify")
    .setDescription("YouTube subscriber verification system")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("Setup YouTube subscriber verification")
        .addStringOption((option) =>
          option
            .setName("channelname")
            .setDescription("YouTube channel name to verify")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("disable").setDescription("Disable YouTube verification")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("status")
        .setDescription("Check verification system status")
    ),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "setup":
        await handleSetup(interaction, client);
        break;
      case "disable":
        await handleDisable(interaction, client);
        break;
      case "status":
        await handleStatus(interaction, client);
        break;
    }
  },
};

async function handleSetup(interaction, client) {
  const channelName = interaction.options.getString("channelname");

  // Check if already set up
  const existingConfig = await ytverifySchema.findOne({
    guildId: interaction.guild.id,
  });

  if (existingConfig) {
    const container = createContainer(
      `${EMOJIS.warning} YouTube verification is already set up for this server!\n\n${EMOJIS.settings} **Current Settings:**\n${EMOJIS.youtube} Channel: \`${existingConfig.channelName}\`\n${EMOJIS.channel} Verification Channel: <#${existingConfig.channelId}>\n${EMOJIS.role} Subscriber Role: <@&${existingConfig.roleId}>\n\nUse \`/ytverify disable\` first to set up again.\n\n*YouTube Subscriber Verifier*`
    );

    const disableButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ytverify_disable")
        .setLabel("Disable System")
        .setStyle(ButtonStyle.Danger)
        .setEmoji(EMOJIS.cross)
    );

    container.addActionRowComponents(disableButton);

    return await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }

  // Create channel selection menu
  const channelRow = new ActionRowBuilder().addComponents(
    new ChannelSelectMenuBuilder()
      .setCustomId("ytverify_channel_select")
      .setPlaceholder(`${EMOJIS.channel} Select the verification channel`)
      .setMaxValues(1)
      .setMinValues(1)
  );

  const container = createContainer(
    `${EMOJIS.loading} **YouTube Verification Setup**\n\nPlease select the channel where users will submit their YouTube subscription screenshots.\n\n${EMOJIS.youtube} **Channel to Verify:** \`${channelName}\`\n\n${EMOJIS.info} Users will need to upload screenshots showing they are subscribed to this channel.\n\n*YouTube Subscriber Verifier*`
  );
  container.addActionRowComponents(channelRow);

  // Store setup data temporarily
  client.ytverifySetupCache = client.ytverifySetupCache || {};
  client.ytverifySetupCache[interaction.user.id] = {
    channelName,
    guildId: interaction.guild.id,
  };

  await interaction.reply({
    components: [container],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
  });
}

async function handleDisable(interaction, client) {
  const config = await ytverifySchema.findOne({
    guildId: interaction.guild.id,
  });

  if (!config) {
    const container = createContainer(
      `${EMOJIS.cross} YouTube verification is not set up for this server.\n\n*YouTube Subscriber Verifier*`
    );
    return await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }

  await ytverifySchema.deleteOne({ guildId: interaction.guild.id });

  const container = createContainer(
    `${EMOJIS.tick} YouTube verification system has been disabled for this server.\n\n*YouTube Subscriber Verifier*`
  );

  await interaction.reply({
    components: [container],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
  });
}

async function handleStatus(interaction, client) {
  const config = await ytverifySchema.findOne({
    guildId: interaction.guild.id,
  });

  if (!config) {
    const container = createContainer(
      `${EMOJIS.cross} YouTube verification is not set up for this server.\n\nUse \`/ytverify setup\` to configure the system.\n\n*YouTube Subscriber Verifier*`
    );
    return await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }

  const status = config.enabled ? "🟢 Enabled" : "🔴 Disabled";
  const container = createContainer(
    `${EMOJIS.shield} **YouTube Verification Status**\n\n${EMOJIS.settings} **Configuration:**\n${EMOJIS.youtube} Channel: \`${config.channelName}\`\n${EMOJIS.channel} Verification Channel: <#${config.channelId}>\n${EMOJIS.role} Subscriber Role: <@&${config.roleId}>\n${EMOJIS.info} System Status: ${status}\n\n*YouTube Subscriber Verifier*`
  );

  const toggleButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ytverify_toggle")
      .setLabel(config.enabled ? "Disable" : "Enable")
      .setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success)
      .setEmoji(config.enabled ? EMOJIS.cross : EMOJIS.tick)
  );

  container.addActionRowComponents(toggleButton);

  await interaction.reply({
    components: [container],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
  });
}

/**
 * Handle channel selection from the setup menu
 * @param {Object} interaction - Discord interaction
 * @param {Object} client - Discord client
 */
async function handleChannelSelect(interaction, client) {
  const channelId = interaction.values[0];
  const cache = client.ytverifySetupCache?.[interaction.user.id];

  if (!cache) {
    const container = createContainer(
      `${EMOJIS.cross} Setup session expired. Please run \`/ytverify setup\` again.\n\n*YouTube Subscriber Verifier*`
    );
    return await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }

  // Update cache with channel ID
  cache.channelId = channelId;

  // Create role selection menu
  const roleRow = new ActionRowBuilder().addComponents(
    new RoleSelectMenuBuilder()
      .setCustomId("ytverify_role_select")
      .setPlaceholder(`${EMOJIS.role} Select the subscriber role`)
      .setMaxValues(1)
      .setMinValues(1)
  );

  const container = createContainer(
    `${EMOJIS.loading} **YouTube Verification Setup**\n\nPlease select the role that will be given to verified subscribers.\n\n${EMOJIS.info} This role will be assigned to users who successfully prove their subscription.\n\n*YouTube Subscriber Verifier*`
  );
  container.addActionRowComponents(roleRow);

  await interaction.update({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });
}

/**
 * Handle role selection from the setup menu
 * @param {Object} interaction - Discord interaction
 * @param {Object} client - Discord client
 */
async function handleRoleSelect(interaction, client) {
  const roleId = interaction.values[0];
  const cache = client.ytverifySetupCache?.[interaction.user.id];

  if (!cache) {
    const container = createContainer(
      `${EMOJIS.cross} Setup session expired. Please run \`/ytverify setup\` again.\n\n*YouTube Subscriber Verifier*`
    );
    return await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }

  try {
    // Save configuration to database
    await ytverifySchema.findOneAndUpdate(
      { guildId: cache.guildId },
      {
        $set: {
          channelName: cache.channelName,
          channelId: cache.channelId,
          roleId: roleId,
          enabled: true,
        },
      },
      { upsert: true, new: true }
    );

    // Clean up cache
    delete client.ytverifySetupCache[interaction.user.id];

    const container = createContainer(
      `${EMOJIS.success} **Setup Complete!**\n\n${EMOJIS.youtube} Channel: \`${cache.channelName}\`\n${EMOJIS.channel} Verification Channel: <#${cache.channelId}>\n${EMOJIS.role} Subscriber Role: <@&${roleId}>\n\n${EMOJIS.info} Users can now submit screenshots in <#${cache.channelId}> to verify their subscription!\n\n*YouTube Subscriber Verifier*`
    );

    await interaction.update({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    console.log(`[YTVerify] Setup completed for guild ${cache.guildId}: channel=${cache.channelName}, verificationChannel=${cache.channelId}, role=${roleId}`);
  } catch (error) {
    console.error('[YTVerify] Setup error:', error);
    const container = createContainer(
      `${EMOJIS.cross} An error occurred while saving the configuration. Please try again.\n\n*YouTube Subscriber Verifier*`
    );
    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }
}

/**
 * Handle button interactions (disable, toggle)
 * @param {Object} interaction - Discord interaction
 * @param {Object} client - Discord client
 */
async function handleButtonInteraction(interaction, client) {
  const customId = interaction.customId;

  if (customId === "ytverify_disable") {
    await handleDisable(interaction, client);
  } else if (customId === "ytverify_toggle") {
    const config = await ytverifySchema.findOne({
      guildId: interaction.guild.id,
    });

    if (!config) {
      const container = createContainer(
        `${EMOJIS.cross} Configuration not found.\n\n*YouTube Subscriber Verifier*`
      );
      return await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }

    const newStatus = !config.enabled;
    await ytverifySchema.updateOne(
      { guildId: interaction.guild.id },
      { $set: { enabled: newStatus } }
    );

    const container = createContainer(
      `${EMOJIS[newStatus ? 'tick' : 'cross']} YouTube verification has been ${newStatus ? 'enabled' : 'disabled'}.\n\n*YouTube Subscriber Verifier*`
    );

    await interaction.update({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }
}

/**
 * Process message attachments for verification
 * @param {Object} message - Discord message
 * @param {Object} client - Discord client
 */
async function processVerification(message, client) {
  try {
    const config = await ytverifySchema.findOne({
      guildId: message.guild.id,
    });

    if (!config || !config.enabled) return;
    if (message.channel.id !== config.channelId) return;
    if (!message.attachments.size) return;

    // Check if user already has the role
    if (message.member.roles.cache.has(config.roleId)) {
      const container = createContainer(
        `${EMOJIS.tick} You are already verified as a subscriber!\n\n*YouTube Subscriber Verifier*`
      );
      await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const attachment = message.attachments.first();
    if (!attachment.contentType?.startsWith('image/')) {
      const container = createContainer(
        `${EMOJIS.cross} Please upload an image file.\n\n*YouTube Subscriber Verifier*`
      );
      await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    console.log(`[YTVerify] ${message.author.tag} submitted verification image: ${attachment.url}`);

    // Send checking message
    const checkingContainer = createContainer(
      `${EMOJIS.loading} Verifying your subscription screenshot...\n\n*YouTube Subscriber Verifier*`
    );
    const checkingMsg = await message.reply({
      components: [checkingContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    try {
      // Fetch and process image
      const response = await fetch(attachment.url);
      const arrayBuffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      // Extract text using OCR
      const extractedText = await extractTextFromImage(imageBuffer);
      console.log(`[YTVerify] OCR extracted text:`, extractedText);

      // Check if text contains channel name and subscription indicators
      const channelName = config.channelName.toLowerCase();
      const textLower = extractedText.toLowerCase();
      
      const subscriptionKeywords = ['subscribed', 'subscribe', 'subscription'];
      const hasChannelName = textLower.includes(channelName);
      const hasSubscriptionKeyword = subscriptionKeywords.some(keyword => textLower.includes(keyword));

      let resultContainer, dmContainer;

      if (hasChannelName && hasSubscriptionKeyword) {
        // Verification successful - assign role
        await message.member.roles.add(config.roleId);
        
        // Record verification in database
        const ytverifiedUsersSchema = require("../../Schemas/ytverifiedUsersSchema");
        await ytverifiedUsersSchema.findOneAndUpdate(
          { guildId: message.guild.id, userId: message.author.id },
          {
            $set: {
              username: message.author.tag,
              verifiedAt: new Date(),
            },
          },
          { upsert: true }
        );

        console.log(`[YTVerify] ${message.author.tag} successfully verified for channel: ${config.channelName}`);

        resultContainer = createContainer(
          `${EMOJIS.success} **Verification Successful!**\n\n${EMOJIS.tick} You have been verified as a subscriber of **${config.channelName}**!\n${EMOJIS.role} The subscriber role has been assigned to you.\n\n*YouTube Subscriber Verifier*`
        );

        dmContainer = createContainer(
          `${EMOJIS.success} **Verification Successful!**\n\nYou have been verified as a YouTube subscriber in **${message.guild.name}**!\n\n${EMOJIS.youtube} Channel: ${config.channelName}\n\n*YouTube Subscriber Verifier*`
        );
      } else {
        // Verification failed
        console.log(`[YTVerify] ${message.author.tag} verification failed. Channel found: ${hasChannelName}, Subscription keyword found: ${hasSubscriptionKeyword}`);

        resultContainer = createContainer(
          `${EMOJIS.cross} **Verification Failed**\n\nCould not verify your subscription to **${config.channelName}**.\n\n${EMOJIS.info} Please ensure your screenshot clearly shows:\n• The channel name: "${config.channelName}"\n• Proof of subscription (Subscribed button or text)\n\n*YouTube Subscriber Verifier*`
        );

        dmContainer = createContainer(
          `${EMOJIS.cross} **Verification Failed**\n\nYour subscription verification in **${message.guild.name}** was unsuccessful.\n\n${EMOJIS.info} Please try again with a clearer screenshot.\n\n*YouTube Subscriber Verifier*`
        );
      }

      // Update the checking message with result
      await checkingMsg.edit({
        components: [resultContainer],
        flags: MessageFlags.IsComponentsV2,
      });

      // Send DM notification
      try {
        await message.author.send({
          components: [dmContainer],
          flags: MessageFlags.IsComponentsV2,
        });
      } catch (dmError) {
        console.log(`[YTVerify] Could not send DM to ${message.author.tag}:`, dmError.message);
      }

    } catch (processError) {
      console.error('[YTVerify] Processing error:', processError);
      
      const errorContainer = createContainer(
        `${EMOJIS.cross} **Processing Error**\n\nAn error occurred while processing your screenshot. Please try again or contact an administrator.\n\n*YouTube Subscriber Verifier*`
      );

      await checkingMsg.edit({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
      });
    }

  } catch (error) {
    console.error('[YTVerify] Verification error:', error);
    const errorContainer = createContainer(
      `${EMOJIS.cross} An unexpected error occurred. Please try again.\n\n*YouTube Subscriber Verifier*`
    );
    await message.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2,
    });
  }
}

// Export interaction and message handlers
module.exports.interactionHandlers = {
  handleChannelSelect,
  handleRoleSelect,
  handleButtonInteraction,
};

module.exports.messageHandlers = {
  processVerification,
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
