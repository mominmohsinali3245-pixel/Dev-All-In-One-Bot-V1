const {
  SlashCommandBuilder,
  PermissionsBitField,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
  ChannelType,
} = require("discord.js");
const voiceschema = require("../../Schemas/jointocreate");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join-to-create")
    .setDescription("Configure your join to create voice channel.")
    .setDMPermission(false)
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("Sets up your join to create voice channel.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription(
              "Specified channel will be your join to create voice channel."
            )
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
        .addChannelOption((option) =>
          option
            .setName("category")
            .setDescription(
              "All new channels will be created in specified category."
            )
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildCategory)
        )
        .addIntegerOption((option) =>
          option
            .setName("voice-limit")
            .setDescription("Set the default limit for the new voice channels.")
            .setMinValue(2)
            .setMaxValue(10)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("disable")
        .setDescription("Disables your join to create voice channel system.")
    ),
  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      ) &&
      interaction.user.id !== "870179991462236170"
    )
      return await interaction.reply({
        content: "You **do not** have the permission to do that!",
        ephemeral: true,
      });

    const data = await voiceschema.findOne({ Guild: interaction.guild.id });
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "setup":
        if (data)
          return await interaction.reply({
            content: `You have **already** set up the **join to create** system! \n> Do **/join-to-create disable** to undo.`,
            ephemeral: true,
          });
        else {
          const channel = await interaction.options.getChannel("channel");
          const category = await interaction.options.getChannel("category");
          const limit =
            (await interaction.options.getInteger("voice-limit")) || 3;

          await voiceschema.create({
            Guild: interaction.guild.id,
            Channel: channel.id,
            Category: category.id,
            VoiceLimit: limit,
          });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**🔊 Join to Create system**\n\n**• Join to Create was Enabled**\n> Your channel (${channel}) will now act as \n> your join to create channel.\n\n**• Category**\n> ${category}\n\n**• Voice Limit**\n> **${limit}**\n\n*🔊 System Setup*`
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
            content: `You **do not** have the **join to create** system **set up**, cannot delete **nothing**..`,
            ephemeral: true,
          });
        else {
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**🔊 Join to Create system**\n\n**• Join to Create was Disabled**\n> Your channel (<#${data.Channel}>) will no longer act as \n> your join to create channel.\n\n*🔊 System Disabled*`
            )
          );

          await voiceschema.deleteMany({ Guild: interaction.guild.id });

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
