const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  SeparatorSpacingSize,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Need help? Shows all commands of bot."),

  async execute(interaction, client) {
    const servers = client.guilds.cache.size;
    const users = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);
    const totalCommands = client.commands.size;
    const botInviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=303600576574&scope=bot%20applications.commands`;

    const categoryCommands = {
      automod: [
        "automod anti-spam",
        "automod anti-link",
        "automod anti-caps",
        "automod anti-invite",
        "automod anti-mention-spam",
        "automod banned-words",
        "automod anti-raid",
        "automod ignore-channel",
        "automod ignore-role",
        "automod whitelist-domain",
        "automod status",
      ],
      setup: [
        "anti-ghostping setup",
        "anti-ghostping disable",
        "anti-ghostping number-reset",
        "join-to-create setup",
        "join-to-create disable",
        "confess setup",
        "confess send",
        "confess disable",
        "counting setup",
        "counting disable",
        "verify setup",
        "verify bypass",
        "verify remove",
        "verify disable",
        "auto-role set",
        "auto-role remove",
        "join-ping add",
        "join-ping disable",
        "join-ping remove",
        "staff-role set",
        "staff-role remove",
        "staff-help",
        "welcome-channel set",
        "welcome-channel remove",
        "suggest-panel setup",
        "suggest-panel delete",
        "suggest-manage",
        "suggest",
        "logs setup",
        "logs disable",
        "poll setup",
        "poll disable",
      ],
      moderation: [
        "ban",
        "kick",
        "lockdown commit",
        "lockdown unlock",
        "lockdown blacklist-add",
        "lockdown blacklist-remove",
        "mass-unban",
        "nick",
        "role add",
        "role remove",
        "role create",
        "role delete",
        "role members",
        "slowmode set",
        "slowmode disable",
        "snipe",
        "timeout",
        "untimeout",
        "warn user",
        "warn remove",
        "warn show",
        "purge human",
        "purge bot",
        "purge all",
      ],
      fun: [
        "fun pp-size",
        "fun impersonate",
        "fun advice",
        "fun dice-roll",
        "fun joke",
        "fun kiss",
        "fun coin-flip",
        "fun slap",
      ],
      giveaways: [
        "giveaway start",
        "giveaway edit",
        "giveaway end",
        "giveaway reroll",
      ],
      information: [
        "bot invite",
        "bot info",
        "bot ping",
        "bot vote",
        "bot uptime",
        "bot changelogs",
        "bot feedback",
        "bot report-bug",
        "bot suggest",
        "bot support",
        "userinfo",
        "help",
        "membercount",
        "serverinfo",
      ],
      music: [
        "247",
        "forward",
        "loop",
        "nowplaying",
        "pause",
        "lyrics",
        "play",
        "queue",
        "replay",
        "resume",
        "rewind",
        "shuffle",
        "skip",
        "stop",
        "volume",
        "radio",
      ],
      images: [
        "images fake-tweet",
        "images cat",
        "images memes",
        "images dog",
        "images gay",
        "images circle-crop",
        "images fake-ytcomment",
        "images jail",
        "images passed",
        "images glass",
        "images pixelate",
        "images triggered",
      ],
      utilities: [
        "afk set",
        "afk remove",
        "steal",
        "webhook create",
        "webhook delete",
        "webhook edit",
        "utilities enlarge",
        "utilities emoji-list",
        "utilities ask-gpt",
        "reminder set",
        "reminder cancel",
        "reminder cancel-all",
      ],
      tools: [
        "tools calculator",
        "tools docs",
        "tools translate",
        "tools weather",
        "tools tts",
        "tools base64 encode",
        "tools base64 decode",
      ],
      youtube: [
        "youtube latestvideo",
        "youtube info",
      ],
    };

    function createMainHelpContainer() {
      const container = new ContainerBuilder();

      // Main help text
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# <:emoji_42:1423037835933651045> Help Panel\n\n<:dots:1423015515026100386> **Total Commands: ${totalCommands}**\n<:dots:1423015515026100386> Serving **${servers}** servers with **${users}** members\n<:dots:1423015515026100386> **Developer:** [itsfizys](https://itsfiizys.com) | [AeroX Dev](https://discord.gg/8wfT8SfB5Z)\n<:dots:1423015515026100386> [Invite](${botInviteUrl}) | [Support Server](https://discord.gg/8wfT8SfB5Z)`
        )
      );

      // Separator
      container.addSeparatorComponents(new SeparatorBuilder());

      // Main modules
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `__**<:home:1423012465989521448> Main Modules**__\n<:reply_1:1423012467952586923> <:automod:1423012469890220055> Automod\n<:reply_1:1423012467952586923> <:setup:1423012472314531890> Setup\n<:reply_1:1423012467952586923> <:moderation:1423012474231459882> Moderation\n<:reply_1:1423012467952586923> <:fun:1423012476777136279> Fun\n<:reply_1:1423012467952586923> <:gift:1423012479134470255> Giveaways\n<:reply_1:1423012467952586923> <:info:1423012481248268408> Information\n\n__**<:plus:1423012486616973374> Extra Modules**__\n<:reply_1:1423012467952586923> <:image:1423012488609534102> Images\n<:reply_1:1423012467952586923> <:util:1423012490534588496> Utilities\n<:reply_1:1423012467952586923> <:tools:1423012492669489222> Tools\n<:reply_1:1423012467952586923> <:yt:1423012496863662273> Youtube Commands`
        )
      );

      // Separator
      container.addSeparatorComponents(new SeparatorBuilder());

      // Add gif
      container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL("https://cdn.discordapp.com/attachments/1414256332592254986/1423014704586166385/standard.gif?ex=68dec537&is=68dd73b7&hm=44f2afa2fe3f8ec5e989c84661fa6b9942a2842ccc886c06aea1d757d2a184eb&")
        )
      );

      // Divider separator
      container.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

      // Add select menu inside container
      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("help_menu")
            .setPlaceholder("Select a category")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
              {
                label: "Help Page",
                value: "home",
                emoji: "<:home:1423012465989521448>",
                description: "Return to main help page",
              },
              {
                label: "Automod",
                value: "automod",
                emoji: "<:automod:1423012469890220055>",
                description: "All commands related to automod",
              },
              {
                label: "Setup",
                value: "setup",
                emoji: "<:setup:1423012472314531890>",
                description: "All commands related to setup",
              },
              {
                label: "Moderation",
                value: "moderation",
                emoji: "<:moderation:1423012474231459882>",
                description: "All commands related to moderation",
              },
              {
                label: "Fun",
                value: "fun",
                emoji: "<:fun:1423012476777136279>",
                description: "All commands related to fun",
              },
              {
                label: "Giveaways",
                value: "giveaways",
                emoji: "<:gift:1423012479134470255>",
                description: "All commands related to giveaways",
              },
              {
                label: "Information",
                value: "information",
                emoji: "<:info:1423012481248268408>",
                description: "All commands related to information",
              },
              {
                label: "Images",
                value: "images",
                emoji: "<:image:1423012488609534102>",
                description: "All commands related to images",
              },
              {
                label: "Utilities",
                value: "utilities",
                emoji: "<:util:1423012490534588496>",
                description: "All commands related to utilities",
              },
              {
                label: "Tools",
                value: "tools",
                emoji: "<:tools:1423012492669489222>",
                description: "All commands related to tools",
              },
              {
                label: "Youtube",
                value: "youtube",
                emoji: "<:yt:1423012496863662273>",
                description: "All commands related to youtube",
              },
            ])
        )
      );

      return container;
    }

    function createCategoryContainer(category) {
      const container = new ContainerBuilder();

      const categoryNames = {
        home: "Help Page",
        automod: "Automod",
        setup: "Setup",
        moderation: "Moderation",
        fun: "Fun",
        giveaways: "Giveaways",
        information: "Information",
        music: "Music",
        images: "Images",
        utilities: "Utilities",
        tools: "Tools",
        youtube: "Youtube",
      };

      if (category === "home") {
        return createMainHelpContainer();
      }

      const commands = categoryCommands[category] || [];
      const commandList = commands.map((cmd) => `\`${cmd}\``).join(", ");

      // Category title
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${categoryNames[category]} Commands`)
      );

      // Separator
      container.addSeparatorComponents(new SeparatorBuilder());

      // Commands list
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(commandList || "No commands available.")
      );

      // Separator
      container.addSeparatorComponents(new SeparatorBuilder());

      // Add gif
      container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL("https://cdn.discordapp.com/attachments/1414256332592254986/1423014704586166385/standard.gif?ex=68dec537&is=68dd73b7&hm=44f2afa2fe3f8ec5e989c84661fa6b9942a2842ccc886c06aea1d757d2a184eb&")
        )
      );

      // Divider separator
      container.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

      // Add select menu inside container
      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("help_menu")
            .setPlaceholder("Select a category")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
              {
                label: "Help Page",
                value: "home",
                emoji: "<:home:1423012465989521448>",
                description: "Return to main help page",
              },
              {
                label: "Automod",
                value: "automod",
                emoji: "<:automod:1423012469890220055>",
                description: "All commands related to automod",
              },
              {
                label: "Setup",
                value: "setup",
                emoji: "<:setup:1423012472314531890>",
                description: "All commands related to setup",
              },
              {
                label: "Moderation",
                value: "moderation",
                emoji: "<:moderation:1423012474231459882>",
                description: "All commands related to moderation",
              },
              {
                label: "Fun",
                value: "fun",
                emoji: "<:fun:1423012476777136279>",
                description: "All commands related to fun",
              },
              {
                label: "Giveaways",
                value: "giveaways",
                emoji: "<:gift:1423012479134470255>",
                description: "All commands related to giveaways",
              },
              {
                label: "Information",
                value: "information",
                emoji: "<:info:1423012481248268408>",
                description: "All commands related to information",
              },
              {
                label: "Images",
                value: "images",
                emoji: "<:image:1423012488609534102>",
                description: "All commands related to images",
              },
              {
                label: "Utilities",
                value: "utilities",
                emoji: "<:util:1423012490534588496>",
                description: "All commands related to utilities",
              },
              {
                label: "Tools",
                value: "tools",
                emoji: "<:tools:1423012492669489222>",
                description: "All commands related to tools",
              },
              {
                label: "Youtube",
                value: "youtube",
                emoji: "<:yt:1423012496863662273>",
                description: "All commands related to youtube",
              },
            ])
        )
      );

      return container;
    }

    const mainContainer = createMainHelpContainer();

    const MESSAGE = await interaction.reply({
      components: [mainContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    const collector = MESSAGE.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 600000,
    });

    collector.on("collect", async (i) => {
      const selectedCategory = i.values[0];
      const categoryContainer = createCategoryContainer(selectedCategory);

      await i.update({
        components: [categoryContainer],
        flags: MessageFlags.IsComponentsV2,
      });
    });

    collector.on("end", () => {
      // Collector ended - components will be disabled automatically
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
