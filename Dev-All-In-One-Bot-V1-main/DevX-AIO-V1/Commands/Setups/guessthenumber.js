const { ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
  ButtonStyle,
  PermissionsBitField,
  Colors,
} = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const Schema = require("../../Schemas/guess");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guess")
    .setDescription("Configure the guess the number settings")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)

    .addSubcommand((subCommand) =>
      subCommand
        .setName("enable")
        .setDescription("Enable guess the number")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel you want as guess the number channel")
            .setRequired(true)
        )
    )

    .addSubcommand((subCommand) =>
      subCommand.setName("disable").setDescription("Disable guess the number")
    ),
  async execute(interaction, client) {
    const { options, guild } = interaction;

    if (options.getSubcommand() === "disable") {
      const data = await Schema.findOne({ guildId: guild.id });

      if (!data) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `❌ | You do not have guess the number setup!`
          )
        );

        return interaction.reply({ 
          components: [container],
          flags: MessageFlags.IsComponentsV2
        });
      }

      if (data) {
        await data.delete();
        return interaction.reply({ content: `✅` });
      }
    }

    if (options.getSubcommand() === "enable") {
      const data = await Schema.findOne({ guildId: guild.id });

      if (data) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `❌ | Your guess the number system is already setup!`
          )
        );

        return interaction.reply({ 
          components: [container],
          flags: MessageFlags.IsComponentsV2
        });
      }

      if (!data) {
        const RandomNumber = Math.floor(Math.random() * 1000000);

        const channel = options.getChannel("channel");
        const channelID = channel.id;

        const newSchema = await Schema.create({
          guildId: guild.id,
          channelId: channelID,
          number: RandomNumber,
        });

        await newSchema.save().catch((err) => console.log(err));

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `✅ | You've successfully setup the guess the number system. \n\nThe number is: ${RandomNumber} \nThe channel is: <#${channelID}>`
          )
        );

        interaction.reply({ 
          components: [container],
          flags: MessageFlags.IsComponentsV2
        });
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
