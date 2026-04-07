
const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } = require("discord.js");
const { PermissionsBitField } = require("discord.js");
const { default: axios } = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("steal")
    .setDMPermission(false)
    .setDescription("Adds specified emoji to the server.")
    .addStringOption((option) =>
      option
        .setName("emoji")
        .setDescription("Specified emoji will be added to the server.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription(
          "Specified name will be applied to specified new emoji."
        )
        .setRequired(true)
    ),
  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageEmojisAndStickers
      )
    ) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`You **do not** have the permission to do that!`)
      );
      return await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        ephemeral: true,
      });
    }

    let emoji = interaction.options.getString("emoji")?.trim();
    const name = interaction.options.getString("name");

    if (emoji.startsWith("<") && emoji.endsWith(">")) {
      const id = emoji.match(/\d{15,}/g)[0];

      const type = await axios
        .get(`https://cdn.discordapp.com/emojis/${id}.gif`)
        .then((image) => {
          if (image) return "gif";
          else return "png";
        })
        .catch((err) => {
          return "png";
        });

      emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`;
    }

    if (!emoji.startsWith("http")) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`You **cannot** add default emojis to your server.`)
      );
      return await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        ephemeral: true,
      });
    }

    if (!emoji.startsWith("https")) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`You **cannot** add default emojis to your server.`)
      );
      return await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        ephemeral: true,
      });
    }

    interaction.guild.emojis
      .create({ attachment: `${emoji}`, name: `${name}` })
      .then((emoji) => {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# 🤔 Emoji Tool\n**Emoji Added**`)
        );
        container.addSeparatorComponents(new SeparatorBuilder());
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Emoji Details**\n${emoji} added with the name of **${name}**`)
        );

        return interaction.reply({ 
          components: [container], 
          flags: MessageFlags.IsComponentsV2 
        });
      })
      .catch((err) => {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`This emoji **failed** to upload, perhaps you have reached your **emoji limit**?`)
        );
        interaction.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
          ephemeral: true,
        });
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
