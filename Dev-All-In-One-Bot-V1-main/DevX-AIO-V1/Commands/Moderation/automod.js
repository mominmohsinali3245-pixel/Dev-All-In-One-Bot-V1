const {
  SlashCommandBuilder,
  PermissionsBitField,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
const automodSchema = require("../../Schemas/automodSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("automod")
    .setDMPermission(false)
    .setDescription("Configure automod settings for your server")
    .addSubcommand((command) =>
      command
        .setName("anti-spam")
        .setDescription("Configure anti-spam settings")
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Enable or disable anti-spam")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("max-messages")
            .setDescription("Maximum messages allowed in time window (default: 5)")
            .setMinValue(2)
            .setMaxValue(20)
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName("time-window")
            .setDescription("Time window in seconds (default: 5)")
            .setMinValue(1)
            .setMaxValue(60)
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Action to take on violation")
            .addChoices(
              { name: "Delete Messages", value: "delete" },
              { name: "Timeout User", value: "timeout" },
              { name: "Kick User", value: "kick" }
            )
            .setRequired(false)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("anti-link")
        .setDescription("Configure anti-link settings")
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Enable or disable anti-link")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Action to take on violation")
            .addChoices(
              { name: "Delete Messages", value: "delete" },
              { name: "Timeout User", value: "timeout" },
              { name: "Warn User", value: "warn" }
            )
            .setRequired(false)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("anti-caps")
        .setDescription("Configure anti-caps settings")
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Enable or disable anti-caps")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("percentage")
            .setDescription("Percentage of caps allowed (default: 70)")
            .setMinValue(50)
            .setMaxValue(100)
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Action to take on violation")
            .addChoices(
              { name: "Delete Messages", value: "delete" },
              { name: "Warn User", value: "warn" }
            )
            .setRequired(false)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("anti-invite")
        .setDescription("Configure anti-invite settings")
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Enable or disable anti-invite")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Action to take on violation")
            .addChoices(
              { name: "Delete Messages", value: "delete" },
              { name: "Timeout User", value: "timeout" },
              { name: "Warn User", value: "warn" }
            )
            .setRequired(false)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("anti-mention-spam")
        .setDescription("Configure anti-mention spam settings")
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Enable or disable anti-mention spam")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("max-mentions")
            .setDescription("Maximum mentions allowed (default: 5)")
            .setMinValue(1)
            .setMaxValue(20)
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Action to take on violation")
            .addChoices(
              { name: "Delete Messages", value: "delete" },
              { name: "Timeout User", value: "timeout" },
              { name: "Kick User", value: "kick" }
            )
            .setRequired(false)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("banned-words")
        .setDescription("Configure banned words filter")
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Enable or disable banned words filter")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("words")
            .setDescription("Comma-separated list of banned words")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Action to take on violation")
            .addChoices(
              { name: "Delete Messages", value: "delete" },
              { name: "Timeout User", value: "timeout" },
              { name: "Warn User", value: "warn" }
            )
            .setRequired(false)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("anti-raid")
        .setDescription("Configure anti-raid protection")
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Enable or disable anti-raid")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("join-threshold")
            .setDescription("Number of joins to trigger raid protection (default: 5)")
            .setMinValue(3)
            .setMaxValue(20)
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName("time-window")
            .setDescription("Time window in seconds (default: 10)")
            .setMinValue(5)
            .setMaxValue(60)
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Action to take on raiders")
            .addChoices(
              { name: "Kick User", value: "kick" },
              { name: "Ban User", value: "ban" }
            )
            .setRequired(false)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("ignore-channel")
        .setDescription("Add or remove a channel from automod ignore list")
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Add or remove channel")
            .addChoices(
              { name: "Add", value: "add" },
              { name: "Remove", value: "remove" }
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to ignore")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("ignore-role")
        .setDescription("Add or remove a role from automod ignore list")
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Add or remove role")
            .addChoices(
              { name: "Add", value: "add" },
              { name: "Remove", value: "remove" }
            )
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("Role to ignore")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("whitelist-domain")
        .setDescription("Add or remove a whitelisted domain for anti-link")
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Add or remove domain")
            .addChoices(
              { name: "Add", value: "add" },
              { name: "Remove", value: "remove" }
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("domain")
            .setDescription("Domain to whitelist (e.g., youtube.com)")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("status")
        .setDescription("View current automod configuration")
    ),
  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageGuild
      )
    )
      return await interaction.reply({
        content: "You need the **Manage Server** permission to configure automod!",
        ephemeral: true,
      });

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    let automodData = await automodSchema.findOne({ Guild: guildId });
    if (!automodData) {
      automodData = await automodSchema.create({ Guild: guildId });
    }

    switch (sub) {
      case "anti-spam": {
        const enabled = interaction.options.getBoolean("enabled");
        const maxMessages = interaction.options.getInteger("max-messages") || automodData.AntiSpam.maxMessages;
        const timeWindow = interaction.options.getInteger("time-window") || automodData.AntiSpam.timeWindow;
        const action = interaction.options.getString("action") || automodData.AntiSpam.action;

        automodData.AntiSpam = {
          enabled,
          maxMessages,
          timeWindow,
          action
        };
        await automodData.save();

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# <:automod:1423012469890220055> Anti-Spam Configuration\n\n` +
            `**Status:** ${enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
            `**Max Messages:** ${maxMessages}\n` +
            `**Time Window:** ${timeWindow}s\n` +
            `**Action:** ${action}`
          )
        );
        
        await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        break;
      }

      case "anti-link": {
        const enabled = interaction.options.getBoolean("enabled");
        const action = interaction.options.getString("action") || automodData.AntiLink.action;

        automodData.AntiLink.enabled = enabled;
        automodData.AntiLink.action = action;
        await automodData.save();

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# <:automod:1423012469890220055> Anti-Link Configuration\n\n` +
            `**Status:** ${enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
            `**Action:** ${action}\n` +
            `**Whitelisted Domains:** ${automodData.AntiLink.whitelistedDomains.length > 0 ? automodData.AntiLink.whitelistedDomains.join(", ") : "None"}`
          )
        );
        
        await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        break;
      }

      case "anti-caps": {
        const enabled = interaction.options.getBoolean("enabled");
        const percentage = interaction.options.getInteger("percentage") || automodData.AntiCaps.percentage;
        const action = interaction.options.getString("action") || automodData.AntiCaps.action;

        automodData.AntiCaps = {
          enabled,
          percentage,
          action
        };
        await automodData.save();

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# <:automod:1423012469890220055> Anti-Caps Configuration\n\n` +
            `**Status:** ${enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
            `**Max Caps Percentage:** ${percentage}%\n` +
            `**Action:** ${action}`
          )
        );
        
        await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        break;
      }

      case "anti-invite": {
        const enabled = interaction.options.getBoolean("enabled");
        const action = interaction.options.getString("action") || automodData.AntiInvite.action;

        automodData.AntiInvite.enabled = enabled;
        automodData.AntiInvite.action = action;
        await automodData.save();

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# <:automod:1423012469890220055> Anti-Invite Configuration\n\n` +
            `**Status:** ${enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
            `**Action:** ${action}`
          )
        );
        
        await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        break;
      }

      case "anti-mention-spam": {
        const enabled = interaction.options.getBoolean("enabled");
        const maxMentions = interaction.options.getInteger("max-mentions") || automodData.AntiMentionSpam.maxMentions;
        const action = interaction.options.getString("action") || automodData.AntiMentionSpam.action;

        automodData.AntiMentionSpam = {
          enabled,
          maxMentions,
          action
        };
        await automodData.save();

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# <:automod:1423012469890220055> Anti-Mention Spam Configuration\n\n` +
            `**Status:** ${enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
            `**Max Mentions:** ${maxMentions}\n` +
            `**Action:** ${action}`
          )
        );
        
        await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        break;
      }

      case "banned-words": {
        const enabled = interaction.options.getBoolean("enabled");
        const wordsInput = interaction.options.getString("words");
        const action = interaction.options.getString("action") || automodData.BannedWords.action;

        automodData.BannedWords.enabled = enabled;
        automodData.BannedWords.action = action;
        
        if (wordsInput) {
          const words = wordsInput.split(",").map(w => w.trim().toLowerCase()).filter(w => w);
          automodData.BannedWords.words = words;
        }
        
        await automodData.save();

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# <:automod:1423012469890220055> Banned Words Configuration\n\n` +
            `**Status:** ${enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
            `**Action:** ${action}\n` +
            `**Banned Words:** ${automodData.BannedWords.words.length > 0 ? automodData.BannedWords.words.join(", ") : "None"}`
          )
        );
        
        await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        break;
      }

      case "anti-raid": {
        const enabled = interaction.options.getBoolean("enabled");
        const joinThreshold = interaction.options.getInteger("join-threshold") || automodData.AntiRaid.joinThreshold;
        const timeWindow = interaction.options.getInteger("time-window") || automodData.AntiRaid.timeWindow;
        const action = interaction.options.getString("action") || automodData.AntiRaid.action;

        automodData.AntiRaid = {
          enabled,
          joinThreshold,
          timeWindow,
          action
        };
        await automodData.save();

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# <:automod:1423012469890220055> Anti-Raid Configuration\n\n` +
            `**Status:** ${enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
            `**Join Threshold:** ${joinThreshold}\n` +
            `**Time Window:** ${timeWindow}s\n` +
            `**Action:** ${action}`
          )
        );
        
        await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        break;
      }

      case "ignore-channel": {
        const actionType = interaction.options.getString("action");
        const channel = interaction.options.getChannel("channel");

        if (actionType === "add") {
          if (!automodData.IgnoredChannels.includes(channel.id)) {
            automodData.IgnoredChannels.push(channel.id);
            await automodData.save();
            
            await interaction.reply({
              content: `✅ ${channel} has been added to the automod ignore list.`,
              ephemeral: true
            });
          } else {
            await interaction.reply({
              content: `${channel} is already in the ignore list.`,
              ephemeral: true
            });
          }
        } else {
          const index = automodData.IgnoredChannels.indexOf(channel.id);
          if (index > -1) {
            automodData.IgnoredChannels.splice(index, 1);
            await automodData.save();
            
            await interaction.reply({
              content: `✅ ${channel} has been removed from the automod ignore list.`,
              ephemeral: true
            });
          } else {
            await interaction.reply({
              content: `${channel} is not in the ignore list.`,
              ephemeral: true
            });
          }
        }
        break;
      }

      case "ignore-role": {
        const actionType = interaction.options.getString("action");
        const role = interaction.options.getRole("role");

        if (actionType === "add") {
          if (!automodData.IgnoredRoles.includes(role.id)) {
            automodData.IgnoredRoles.push(role.id);
            await automodData.save();
            
            await interaction.reply({
              content: `✅ ${role} has been added to the automod ignore list.`,
              ephemeral: true
            });
          } else {
            await interaction.reply({
              content: `${role} is already in the ignore list.`,
              ephemeral: true
            });
          }
        } else {
          const index = automodData.IgnoredRoles.indexOf(role.id);
          if (index > -1) {
            automodData.IgnoredRoles.splice(index, 1);
            await automodData.save();
            
            await interaction.reply({
              content: `✅ ${role} has been removed from the automod ignore list.`,
              ephemeral: true
            });
          } else {
            await interaction.reply({
              content: `${role} is not in the ignore list.`,
              ephemeral: true
            });
          }
        }
        break;
      }

      case "whitelist-domain": {
        const actionType = interaction.options.getString("action");
        const domain = interaction.options.getString("domain").toLowerCase().trim();

        if (actionType === "add") {
          if (!automodData.AntiLink.whitelistedDomains.includes(domain)) {
            automodData.AntiLink.whitelistedDomains.push(domain);
            await automodData.save();
            
            await interaction.reply({
              content: `✅ **${domain}** has been added to the whitelisted domains.`,
              ephemeral: true
            });
          } else {
            await interaction.reply({
              content: `**${domain}** is already whitelisted.`,
              ephemeral: true
            });
          }
        } else {
          const index = automodData.AntiLink.whitelistedDomains.indexOf(domain);
          if (index > -1) {
            automodData.AntiLink.whitelistedDomains.splice(index, 1);
            await automodData.save();
            
            await interaction.reply({
              content: `✅ **${domain}** has been removed from the whitelisted domains.`,
              ephemeral: true
            });
          } else {
            await interaction.reply({
              content: `**${domain}** is not in the whitelist.`,
              ephemeral: true
            });
          }
        }
        break;
      }

      case "status": {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# <:automod:1423012469890220055> Automod Configuration Status`)
        );
        container.addSeparatorComponents(new SeparatorBuilder());
        
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Anti-Spam:** ${automodData.AntiSpam.enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
            `**Anti-Link:** ${automodData.AntiLink.enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
            `**Anti-Caps:** ${automodData.AntiCaps.enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
            `**Anti-Invite:** ${automodData.AntiInvite.enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
            `**Anti-Mention Spam:** ${automodData.AntiMentionSpam.enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
            `**Banned Words:** ${automodData.BannedWords.enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
            `**Anti-Raid:** ${automodData.AntiRaid.enabled ? "✅ Enabled" : "❌ Disabled"}`
          )
        );
        
        container.addSeparatorComponents(new SeparatorBuilder());
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Ignored Channels:** ${automodData.IgnoredChannels.length}\n` +
            `**Ignored Roles:** ${automodData.IgnoredRoles.length}`
          )
        );
        
        await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        break;
      }
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
