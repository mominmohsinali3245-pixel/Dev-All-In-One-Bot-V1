const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} = require("discord.js");
const axios = require("axios").default;

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`images`)
    .setDescription(`This is a subcommand images`)
    .addSubcommand((command) =>
      command.setName(`cat`).setDescription(`Get a random cat image`)
    )
    .addSubcommand((command) =>
      command.setName(`dog`).setDescription(`Generates a random dog image`)
    )
    .addSubcommand((command) =>
      command
        .setName(`fake-tweet`)
        .setDescription(`Post a real tweet 🐦`)
        .addStringOption((option) =>
          option
            .setName("tweet")
            .setDescription("Enter your tweet")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName(`fake-ytcomment`)
        .setDescription(`Post a real youtube comment 🔴`)
        .addStringOption((option) =>
          option
            .setName("comment")
            .setDescription("Enter your comment")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command.setName(`meme`).setDescription(`Generates a meme image 😜`)
    )
    .addSubcommand((command) =>
      command
        .setName(`jail`)
        .setDescription(`Get a jail form of a user's avatar, easy as that.`)
        .addUserOption((option) =>
          option.setName("user").setDescription("Select a user")
        )
    )
    .addSubcommand((command) =>
      command
        .setName(`gay`)
        .setDescription(`Get a gay form of a user's avatar.`)
        .addUserOption((option) =>
          option.setName("user").setDescription("Select a user")
        )
    )
    .addSubcommand((command) =>
      command
        .setName(`pixelate`)
        .setDescription(`Get a pixelated form of a user's avatar.`)
        .addUserOption((option) =>
          option.setName("user").setDescription("Select a user")
        )
    )
    .addSubcommand((command) =>
      command
        .setName(`passed`)
        .setDescription(`Get a gta passed form of a user's avatar.`)
        .addUserOption((option) =>
          option.setName("user").setDescription("Select a user")
        )
    )
    .addSubcommand((command) =>
      command
        .setName(`wasted`)
        .setDescription(`Get a gta wasted form of a user's avatar.`)
        .addUserOption((option) =>
          option.setName("user").setDescription("Select a user")
        )
    )
    .addSubcommand((command) =>
      command
        .setName(`triggered`)
        .setDescription(`Get a triggered form of a user's avatar.`)
        .addUserOption((option) =>
          option.setName("user").setDescription("Select a user")
        )
    )
    .addSubcommand((command) =>
      command
        .setName(`circle-crop`)
        .setDescription(`Get a circle cropped form of a user's avatar.`)
        .addUserOption((option) =>
          option.setName("user").setDescription("Select a user")
        )
    )
    .addSubcommand((command) =>
      command
        .setName(`glass`)
        .setDescription(`Get a glass form of a user's avatar.`)
        .addUserOption((option) =>
          option.setName("user").setDescription("Select a user")
        )
    ),
  async execute(interaction, client) {
    const command = interaction.options.getSubcommand();

    switch (command) {
      case "cat":
        try {
          const response = await axios.get(
            "https://api.thecatapi.com/v1/images/search"
          );
          const imageUrl = response.data[0].url;

          const container = new ContainerBuilder();

          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# 🐱 Random Cat Image")
          );

          container.addSeparatorComponents(new SeparatorBuilder());

          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL(imageUrl)
                .setDescription("Random Cat")
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        } catch (error) {
          console.error(error);
          await interaction.reply(
            "Sorry, there was an error getting the cat image."
          );
        }
        break;

      case "dog":
        try {
          const response = await axios.get(
            "https://dog.ceo/api/breeds/image/random"
          );
          const imageUrl = response.data.message;

          const container = new ContainerBuilder();

          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# 🐶 Random Dog")
          );

          container.addSeparatorComponents(new SeparatorBuilder());

          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL(imageUrl)
                .setDescription("Random Dog")
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        } catch (error) {
          console.error(error);
          await interaction.reply(
            "Sorry, there was an error generating a random dog image."
          );
        }
        break;

      case "jail":
        {
          const { options, user } = interaction;
          let target = options.getUser("user") || user;
          let avatarUrl = target.avatarURL({ size: 512, extension: "jpg" });
          let canvas = `https://some-random-api.com/canvas/jail?avatar=${avatarUrl}`;

          const container = new ContainerBuilder();

          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# 🚔 Jail")
          );

          container.addSeparatorComponents(new SeparatorBuilder());

          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL(canvas)
                .setDescription(`${target.username}'s avatar`)
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        }
        break;

      case "gay":
        {
          const { options, user } = interaction;
          let target = options.getUser("user") || user;
          let avatarUrl = target.avatarURL({ size: 512, extension: "jpg" });
          let canvas = `https://some-random-api.com/canvas/gay?avatar=${avatarUrl}`;

          const container = new ContainerBuilder();

          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# 🌈 Gay Filter")
          );

          container.addSeparatorComponents(new SeparatorBuilder());

          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL(canvas)
                .setDescription(`${target.username}'s avatar`)
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        }
        break;

      case "glass":
        {
          const { options, user } = interaction;
          let target = options.getUser("user") || user;
          let avatarUrl = target.avatarURL({ size: 512, extension: "jpg" });
          let canvas = `https://some-random-api.com/canvas/glass?avatar=${avatarUrl}`;

          const container = new ContainerBuilder();

          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# 🔍 Glass Effect")
          );

          container.addSeparatorComponents(new SeparatorBuilder());

          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL(canvas)
                .setDescription(`${target.username}'s avatar`)
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        }
        break;

      case "fake-tweet":
        {
          let tweet = interaction.options.getString("tweet");
          let avatarUrl = interaction.user.avatarURL({ extension: "jpg" });
          let canvas = `https://some-random-api.com/canvas/tweet?avatar=${avatarUrl}&displayname=${
            interaction.user.username
          }&username=${interaction.user.username}&comment=${encodeURIComponent(
            tweet
          )}`;

          const container = new ContainerBuilder();

          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# 🐦 Fake Tweet")
          );

          container.addSeparatorComponents(new SeparatorBuilder());

          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL(canvas)
                .setDescription("Your fake tweet")
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        }
        break;

      case "pixelate":
        {
          const { options, user } = interaction;
          let target = options.getUser("user") || user;
          let avatarUrl = target.avatarURL({ size: 512, extension: "jpg" });
          let canvas = `https://some-random-api.com/canvas/pixelate?avatar=${avatarUrl}`;

          const container = new ContainerBuilder();

          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# 🟦 Pixelate")
          );

          container.addSeparatorComponents(new SeparatorBuilder());

          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL(canvas)
                .setDescription(`${target.username}'s avatar`)
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        }
        break;

      case "circle-crop":
        {
          const { options, user } = interaction;
          let target = options.getUser("user") || user;
          let avatarUrl = target.avatarURL({ size: 512, extension: "jpg" });
          let canvas = `https://some-random-api.com/canvas/circle?avatar=${avatarUrl}`;

          const container = new ContainerBuilder();

          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# ⭕ Circle Crop")
          );

          container.addSeparatorComponents(new SeparatorBuilder());

          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL(canvas)
                .setDescription(`${target.username}'s avatar`)
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        }
        break;

      case "fake-ytcomment":
        {
          let comment = interaction.options.getString("comment");
          let avatarUrl = interaction.user.avatarURL({ extension: "jpg" });
          let canvas = `https://some-random-api.com/canvas/youtube-comment?avatar=${avatarUrl}&displayname=${
            interaction.user.username
          }&username=${interaction.user.username}&comment=${encodeURIComponent(
            comment
          )}`;

          const container = new ContainerBuilder();

          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# 🔴 Fake YouTube Comment")
          );

          container.addSeparatorComponents(new SeparatorBuilder());

          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL(canvas)
                .setDescription("Your fake YouTube comment")
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        }
        break;

      case "triggered":
        {
          const { options, user } = interaction;
          let target = options.getUser("user") || user;
          let avatarUrl = target.avatarURL({ size: 512, extension: "jpg" });
          let canvas = `https://some-random-api.com/canvas/triggered?avatar=${avatarUrl}`;

          const container = new ContainerBuilder();

          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# 😡 Triggered")
          );

          container.addSeparatorComponents(new SeparatorBuilder());

          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL(canvas)
                .setDescription(`${target.username}'s avatar`)
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        }
        break;

      case "passed":
        {
          const { options, user } = interaction;
          let target = options.getUser("user") || user;
          let avatarUrl = target.avatarURL({ size: 512, extension: "jpg" });
          let canvas = `https://some-random-api.com/canvas/passed?avatar=${avatarUrl}`;

          const container = new ContainerBuilder();

          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# ✅ Passed")
          );

          container.addSeparatorComponents(new SeparatorBuilder());

          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL(canvas)
                .setDescription(`${target.username}'s avatar`)
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        }
        break;

      case "wasted":
        {
          const { options, user } = interaction;
          let target = options.getUser("user") || user;
          let avatarUrl = target.avatarURL({ size: 512, extension: "jpg" });
          let canvas = `https://some-random-api.com/canvas/wasted?avatar=${avatarUrl}`;

          const container = new ContainerBuilder();

          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("# ☠️ Wasted")
          );

          container.addSeparatorComponents(new SeparatorBuilder());

          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL(canvas)
                .setDescription(`${target.username}'s avatar`)
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        }
        break;

      case "meme":
        try {
          const response = await fetch(
            `https://www.reddit.com/r/memes/random/.json`
          );
          const meme = await response.json();

          const title = meme[0].data.children[0].data.title;
          const image = meme[0].data.children[0].data.url;
          const author = meme[0].data.children[0].data.author;

          const container = new ContainerBuilder();

          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${title}`)
          );

          container.addSeparatorComponents(new SeparatorBuilder());

          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL(image)
                .setDescription(`By u/${author}`)
            )
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        } catch (error) {
          console.error(error);
          await interaction.reply(
            "Sorry, there was an error getting a meme."
          );
        }
        break;
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
