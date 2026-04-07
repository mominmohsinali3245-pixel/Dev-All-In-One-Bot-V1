const { SlashCommandBuilder } = require("@discordjs/builders");
const { ContainerBuilder, TextDisplayBuilder, MessageFlags, PermissionsBitField } = require("discord.js");
const boosterSchema = require("../../Schemas/boosterSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("booster-channel")
    .setDescription("configure your booster channel")
    .addSubcommand((command) =>
      command
        .setName("set")
        .setDescription("set your booster channel")
        .addChannelOption((option) =>
          option
            .setName("channel1")
            .setDescription("choose your channel for booster")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel2")
            .setDescription("log for your booster")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command.setName("remove").setDescription("remove your booster channel")
    ),

  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: "You **do not** have permission to do that!",
        ephemeral: true,
      });

    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "set":
        const Channel1 = interaction.options.getChannel("channel1");
        const Channel2 = interaction.options.getChannel("channel2");

        const boosterdata = await boosterSchema.findOne({
          Guild: interaction.guild.id,
        });

        if (boosterdata)
          return interaction.reply({
            content: `You **already** have a booster channel (<#${boosterdata.Channel}>)`,
            ephemeral: true,
          });
        else {
          await boosterSchema.create({
            Guild: interaction.guild.id,
            Channel1: Channel1.id,
            Channel2: Channel2.id,
          });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Booster Channel**\n\n# > Your Booster Channel Has \n Been Set Successfully!\n\n**Channel was Set**\n>The channel ${Channel1} has been \n set as your Booster channel.\n\n*Enjoy Using Booster*`
            )
          );

          await interaction.reply({ 
            components: [container],
            flags: MessageFlags.IsComponentsV2
          });
        }

        break;

      case "remove":
        if (
          !interaction.member.permissions.has(
            PermissionsBitField.Flags.Administrator
          )
        )
          return await interaction.reply({
            content: "You **do not** have permission to do that!",
            ephemeral: true,
          });

        const boosterdatas = await boosterSchema.findOne({
          Guild: interaction.guild.id,
        });

        if (!boosterdatas)
          return await interaction.reply({
            content: `You **do not** have a booster channel yet.`,
            ephemeral: true,
          });
        else {
          await boosterSchema.deleteMany({
            Guild: interaction.guild.id,
          });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Booster Channel**\n\n# > Your Booster Channel has \n been remoed successfully\n\n**Your channel was removed**\n> your channel for Booster has no longer in your server\n\n*Bay bay Booster*`
            )
          );

          await interaction.reply({ 
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
