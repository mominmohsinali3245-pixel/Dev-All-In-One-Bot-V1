
const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  SeparatorSpacingSize,
} = require("discord.js");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`fun`)
    .setDescription(`This is a subcommand fun`)
    .addSubcommand((command) =>
      command.setName(`pp-size`).setDescription(`Shows the size of your pp.`)
    )
    .addSubcommand((command) =>
      command
        .setName(`impersonate`)
        .setDescription(`Impersonate a user's message.`)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to impersonate")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("The message to send as the user")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command.setName(`advice`).setDescription(`Get a random advice.`)
    )
    .addSubcommand((command) =>
      command.setName(`dice-roll`).setDescription(`Roll a dice. (1~6) 🎲`)
    )
    .addSubcommand((command) =>
      command.setName(`joke`).setDescription(`Get a funny joke 🤣`)
    )
    .addSubcommand((command) =>
      command
        .setName(`kiss`)
        .setDescription(`Kiss a user. 😘`)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("the user you want to kiss.")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command.setName(`coin-flip`).setDescription(`Flip a coin.`)
    )
    .addSubcommand((command) =>
      command
        .setName(`slap`)
        .setDescription(`Give the user a slap! 👋`)
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("Who do u wanna slap?")
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "pp-size": {
        const penisSize = Math.floor(Math.random() * 10) + 1;
        let penismain = "8";
        for (let i = 0; i < penisSize; i++) {
          penismain += "=";
        }

        const penisContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# ${interaction.user.username}'s Penis Size 😶`
            )
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `Your penis size is  ${penismain}D`
            )
          );

        await interaction.reply({
          components: [penisContainer],
          flags: MessageFlags.IsComponentsV2,
        });
        break;
      }

      case "impersonate": {
        const targetUser = interaction.options.getUser("user");
        const message = interaction.options.getString("message");

        const impersonateContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**${targetUser.username}** says:`
            )
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(message)
          );

        await interaction.reply({
          components: [impersonateContainer],
          flags: MessageFlags.IsComponentsV2,
        });
        break;
      }

      case "advice": {
        const data = await fetch("https://api.adviceslip.com/advice").then(
          (res) => res.json()
        );

        const adviceContainer = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**${data.slip.advice}**`)
        );

        await interaction.reply({
          components: [adviceContainer],
          flags: MessageFlags.IsComponentsV2,
        });
        break;
      }

      case "dice-roll": {
        const choices = ["1 ", "2", "3", "4", "5", "6"];
        const randomChoice =
          choices[Math.floor(Math.random() * choices.length)];

        const diceContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# 🎲 | Your dice have been rolled...`
            )
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `Your number is **${randomChoice.trim()}**!`
            )
          );

        await interaction.reply({
          components: [diceContainer],
          flags: MessageFlags.IsComponentsV2,
        });
        break;
      }

      case "joke": {
        try {
          const data = await fetch(
            "https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit"
          ).then((res) => res.json());

          if (!data || data.error) {
            throw new Error("No joke returned from API");
          }

          let jokeText = "";
          if (data.type === "single") {
            jokeText = data.joke;
          } else {
            jokeText = `${data.setup}\n\n${data.delivery}`;
          }

          const jokeContainer = new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# 😂 Random Joke`)
            )
            .addSeparatorComponents(
              new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
                .setDivider(true)
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(jokeText)
            );

          await interaction.reply({
            components: [jokeContainer],
            flags: MessageFlags.IsComponentsV2,
          });
        } catch (error) {
          console.error("Joke API error:", error);

          const errorContainer = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "⚠️ Failed to fetch a joke. Please try again later!"
            )
          );

          await interaction.reply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2,
          });
        }
        break;
      }

      case "slap": {
        const user = interaction.options.getUser("target");

        // Using Tenor API v2 (no API key needed for basic usage)
        let randomGif = "https://media.tenor.com/x8v1oNUOmg4AAAAC/rickroll-roll.gif"; // fallback
        try {
          const tenorData = await fetch(
            "https://tenor.googleapis.com/v2/search?q=anime-slap&key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&limit=10"
          ).then((res) => res.json());
          
          if (tenorData.results && tenorData.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * tenorData.results.length);
            randomGif = tenorData.results[randomIndex].media_formats.gif.url;
          }
        } catch (error) {
          console.error("Tenor API error:", error);
        }

        const slapContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# 👋 Slap!`)
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**${interaction.user.username}** slapped **${user.username}**! 💥`
            )
          )
          .addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder().setURL(randomGif)
            )
          );

        await interaction.reply({
          components: [slapContainer],
          flags: MessageFlags.IsComponentsV2,
        });
        break;
      }

      case "kiss": {
        const user = interaction.options.getUser("user");

        // Using Tenor API v2 (no API key needed for basic usage)
        let randomGif = "https://media.tenor.com/x8v1oNUOmg4AAAAC/rickroll-roll.gif"; // fallback
        try {
          const tenorData = await fetch(
            "https://tenor.googleapis.com/v2/search?q=anime-kiss&key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&limit=10"
          ).then((res) => res.json());
          
          if (tenorData.results && tenorData.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * tenorData.results.length);
            randomGif = tenorData.results[randomIndex].media_formats.gif.url;
          }
        } catch (error) {
          console.error("Tenor API error:", error);
        }

        const kissContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# 😘 Kiss`)
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**${interaction.user.username}** kissed **${user.username}**! 💕`
            )
          )
          .addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder().setURL(randomGif)
            )
          );

        await interaction.reply({
          components: [kissContainer],
          flags: MessageFlags.IsComponentsV2,
        });
        break;
      }

      case "coin-flip": {
        const choices = ["Heads", "Tails"];
        const randomChoice =
          choices[Math.floor(Math.random() * choices.length)];

        const emoji = "<:coinn:1423012538429345872>";

        const resultContainer = new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# 🪙 Coin Flip Result`
            )
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `${emoji} It's **${randomChoice}**!`
            )
          );

        await interaction.reply({
          components: [resultContainer],
          flags: MessageFlags.IsComponentsV2,
        });
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
