const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
  PermissionsBitField,
} = require("discord.js");
const countingschema = require("../../Schemas/counting");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("counting")
    .setDescription("Config your counting system.")
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("Sets up the counting system for you.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Specified channel will be your counting channel.")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("disable")
        .setDescription("Disables the counting system for your server.")
    ),
  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: `You **do not** have the permission to do that!`,
        ephemeral: true,
      });

    const sub = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel("channel");
    const data = await countingschema.findOne({ Guild: interaction.guild.id });

    switch (sub) {
      case "setup":
        if (data)
          return await interaction.reply({
            content: `You **already** have a counting system set up in this server!`,
            ephemeral: true,
          });
        else {
          countingschema.create({
            Guild: interaction.guild.id,
            Channel: channel.id,
            Count: 0,
          });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**🔢 Counting System**\n\n# > Counting Setup\n\n**• System Setup**\n> Your channel (${channel}) was set up to be \n> your counting channel!\n\n*🔢 Counting was Setup*`
            )
          );

          await interaction.reply({ 
            components: [container],
            flags: MessageFlags.IsComponentsV2
          });
        }

        break;

      case "disable":
        if (!data)
          return await interaction.reply({
            content: `No **counting system** found, cannot delete nothing..`,
            ephemeral: true,
          });
        else {
          await countingschema.deleteMany();
          data.save();

          await interaction.reply({
            content: `Your **counting system** has been disabled!`,
            ephemeral: true,
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
