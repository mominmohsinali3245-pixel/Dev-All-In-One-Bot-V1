
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} = require(`discord.js`);

const { Types } = require("mongoose");
const schedule = require("node-schedule");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`utilities`)
    .setDescription(`Idk put whatever xD`)
    .addSubcommand((command) =>
      command
        .setName(`enlarge`)
        .setDescription(`Enlarge an emoji`)
        .addStringOption((option) =>
          option
            .setName("emoji")
            .setDescription("The emoji to enlarge")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command.setName(`emoji-list`).setDescription(`Displays guilds emojis.`)
    )
    .addSubcommand((command) =>
      command
        .setName(`avatar`)
        .setDescription(`Get anybody's Profile Picture / Banner.`)
        .addUserOption((option) =>
          option
            .setName(`user`)
            .setDescription(`Select a user`)
            .setRequired(false)
        )
    )
    .addSubcommand((command) =>
      command
        .setName(`ask-gpt`)
        .setDescription(`Ask Gpt 3.0 some questions`)
        .addStringOption((options) =>
          options
            .setName("query")
            .setDescription("Give a query")
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    
    // Enlarge
    switch (sub) {
      case "enlarge":
        const emoji = interaction.options.getString("emoji");

        const emojiRegex = /^<a?:.+:(\d+)>$/;
        const match = emoji.match(emojiRegex);

        if (!match) {
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`Please provide a valid emoji!`)
          );
          return await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
            ephemeral: true,
          });
        }

        const emojiId = match[1];

        const enlargedEmojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${
          emoji.startsWith("<a:") ? "gif" : "png"
        }?size=1024`;

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# Enlarged Emoji\n\n[Download Emoji](${enlargedEmojiUrl})`)
        );
        container.addSeparatorComponents(new SeparatorBuilder());
        container.addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder()
              .setURL(enlargedEmojiUrl)
              .setDescription("Enlarged Emoji")
          )
        );

        await interaction.reply({ 
          components: [container], 
          flags: MessageFlags.IsComponentsV2 
        });
    }

    // Emoji-list
    switch (sub) {
      case "emoji-list":
        const emojis = interaction.guild.emojis.cache.map(
          (e) => `${e} | \`${e}\``
        );
        const pageSize = 10;
        const pages = Math.ceil(emojis.length / pageSize);
        let currentPage = 0;

        const generateContainer = (page) => {
          const start = page * pageSize;
          const end = start + pageSize;
          const emojiList = emojis.slice(start, end).join("\n") || "This server has no emojis.";

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# Emojis (Page ${page + 1} of ${pages})`)
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(emojiList)
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("previous")
                .setLabel("Previous")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("next")
                .setLabel("Next")
                .setStyle(ButtonStyle.Primary)
            )
          );
          return container;
        };

        const message = await interaction.reply({
          components: [generateContainer(currentPage)],
          flags: MessageFlags.IsComponentsV2,
          fetchReply: true,
        });

        const collector = await message.createMessageComponentCollector();

        collector.on("collect", async (i) => {
          if (i.customId === "previous") {
            currentPage--;
            if (currentPage < 0) {
              currentPage = pages - 1;
            }
          } else if (i.customId === "next") {
            currentPage++;
            if (currentPage > pages - 1) {
              currentPage = 0;
            }
          }
          await i.update({
            components: [generateContainer(currentPage)],
            flags: MessageFlags.IsComponentsV2,
          });
        });

        collector.on("end", async () => {
          const disabledContainer = new ContainerBuilder();
          disabledContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# Emojis (Page ${currentPage + 1} of ${pages})\n\n*This interaction has expired*`)
          );
          await message.edit({ 
            components: [disabledContainer], 
            flags: MessageFlags.IsComponentsV2 
          });
        });
    }

    // Ask-GPT
    switch (sub) {
      case "ask-gpt":
        const { user, options } = interaction;
        const query =
          (await options.getString("query")) || "How are you? - Not provided";

        await interaction.deferReply();
        const axios = require("axios");
        const groqApiKey = client.config.groqapi;

        try {
          const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "llama-3.3-70b-versatile",
              messages: [
                {
                  role: "user",
                  content: query
                }
              ],
              temperature: 0.5,
              max_tokens: 200,
              top_p: 1.0
            },
            {
              headers: {
                "Authorization": `Bearer ${groqApiKey}`,
                "Content-Type": "application/json"
              }
            }
          );

          const gptResponse = response.data.choices[0].message.content;

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# Ask GPT\n**Query:** \`${query}\``)
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**Response:**\n\`\`\`${gptResponse}\`\`\``)
          );
          interaction.editReply({ 
            components: [container], 
            flags: MessageFlags.IsComponentsV2,
            ephemeral: true 
          });
        } catch (error) {
          console.error("Groq API Error:", error);
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`I didn't understand!, can you run the command again?`)
          );
          interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
            ephemeral: true,
          });
        }
    }

    // Avatar
    switch (sub) {
      case "avatar":
        const usermention =
          interaction.options.getUser(`user`) || interaction.user;
        let banner = await (
          await client.users.fetch(usermention.id, { force: true })
        ).bannerURL({ dynamic: true, size: 4096 });

        const generateAvatarContainer = () => {
          const avatarUrl = usermention.displayAvatarURL({ size: 1024, format: "png", dynamic: true });
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${usermention.tag}\n**[Download Avatar](${avatarUrl})**`)
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL(avatarUrl)
                .setDescription(`${usermention.tag}'s Avatar`)
            )
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel(`Avatar`)
                .setCustomId(`avatar`)
                .setDisabled(true)
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setLabel(`Banner`)
                .setCustomId(`banner`)
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setLabel(`Delete`)
                .setCustomId(`delete`)
                .setStyle(ButtonStyle.Danger)
            )
          );
          return container;
        };

        const generateBannerContainer = () => {
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${usermention.tag}\n${banner ? `**[Download Banner](${banner})**` : "User does not have a banner"}`)
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          if (banner) {
            container.addMediaGalleryComponents(
              new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder()
                  .setURL(banner)
                  .setDescription(`${usermention.tag}'s Banner`)
              )
            );
            container.addSeparatorComponents(new SeparatorBuilder());
          }
          container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel(`Avatar`)
                .setCustomId(`avatar`)
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setLabel(`Banner`)
                .setCustomId(`banner`)
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setLabel(`Delete`)
                .setCustomId(`delete`)
                .setStyle(ButtonStyle.Danger)
            )
          );
          return container;
        };

        const message = await interaction.reply({
          components: [generateAvatarContainer()],
          flags: MessageFlags.IsComponentsV2,
        });
        
        const collector = await message.createMessageComponentCollector();

        collector.on(`collect`, async (c) => {
          if (c.customId === "avatar") {
            if (c.user.id !== interaction.user.id) {
              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`Only ${interaction.user.tag} can interact with the buttons!`)
              );
              return await c.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
                ephemeral: true,
              });
            }

            await c.update({ 
              components: [generateAvatarContainer()], 
              flags: MessageFlags.IsComponentsV2 
            });
          }

          if (c.customId === "banner") {
            if (c.user.id !== interaction.user.id) {
              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`Only ${interaction.user.tag} can interact with the buttons!`)
              );
              return await c.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
                ephemeral: true,
              });
            }

            await c.update({ 
              components: [generateBannerContainer()], 
              flags: MessageFlags.IsComponentsV2 
            });
          }

          if (c.customId === "delete") {
            if (c.user.id !== interaction.user.id) {
              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`Only ${interaction.user.tag} can interact with the buttons!`)
              );
              return await c.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
                ephemeral: true,
              });
            }

            interaction.deleteReply();
          }
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
