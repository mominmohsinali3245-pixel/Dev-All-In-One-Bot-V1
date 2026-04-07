const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
  ActionRowBuilder,
  PermissionsBitField,
  ButtonStyle,
  ButtonBuilder,
  ChannelType,
} = require("discord.js");
const pingschema = require("../../Schemas/joinping");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join-ping")
    .setDescription("Configure your join ping system.")
    .addSubcommand((command) =>
      command
        .setName("add")
        .setDescription(
          "User will receive a ping in specified channel when joining."
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("User will receive the ping in specified channel.")
            .setRequired(true)
            .addChannelTypes(
              ChannelType.GuildAnnouncement,
              ChannelType.GuildText
            )
        )
    )
    .addSubcommand((command) =>
      command
        .setName("remove")
        .setDescription(
          "User will stop receiving pings from specified channel when joining."
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription(
              "Specified channel will no longer use the join ping system."
            )
            .setRequired(true)
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement
            )
        )
    )
    .addSubcommand((command) =>
      command
        .setName("disable")
        .setDescription("Disables all join pings. Use with caution.")
    ),
  async execute(interaction, client, err) {
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
    const sub = interaction.options.getSubcommand();
    const executer = await interaction.user.id;
    const pingdata = await pingschema.findOne({ Guild: interaction.guild.id });
    const channel = await interaction.options.getChannel("channel");

    switch (sub) {
      case "add":
        if (!pingdata) {
          await pingschema.create({
            Guild: interaction.guild.id,
            Channel: channel.id,
          });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**🔔 Join Ping System**\n\n# > Ping Added\n\n**• Ping Added**\n> Your channel (${channel}) will now \n> be a pinged channel for \n> any new members.\n\n*🔔 Join Ping Added*`
            )
          );

          await interaction.reply({ 
            components: [container],
            flags: MessageFlags.IsComponentsV2
          });
        } else {
          if (pingdata.Channel.includes(channel.id))
            return await interaction.reply({
              content: `You **already** have a ping **set up** for ${channel}!`,
              ephemeral: true,
            });
          else {
            await pingschema.updateOne(
              { Guild: interaction.guild.id },
              { $push: { Channel: channel.id } }
            );
            
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `**🔔 Join Ping System**\n\n# > Ping Added\n\n**• Ping Added**\n> Your channel (${channel}) will now \n> be a pinged channel for \n> any new members.\n\n*🔔 Join Ping Added*`
              )
            );

            await interaction.reply({ 
              components: [container],
              flags: MessageFlags.IsComponentsV2
            });
          }
        }

        break;
      case "remove":
        if (!pingdata)
          return await interaction.reply({
            content: `You **have not** added any **join pings** yet, cannot remove **nothing**..`,
            ephemeral: true,
          });
        else {
          if (!pingdata.Channel.includes(channel.id))
            return await interaction.reply({
              content: `You **do not** have a ping **set up** for ${channel}!`,
              ephemeral: true,
            });
          else {
            await pingschema.updateOne(
              { Guild: interaction.guild.id },
              { $pull: { Channel: channel.id } }
            );
            
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `**🔔 Join Ping System**\n\n# > Ping Removed\n\n**• Ping Added**\n> Your channel (${channel}) will no \n> longer be a pinged channel for \n> any new members.\n\n*🔔 Join Ping Removed*`
              )
            );

            await interaction.reply({ 
              components: [container],
              flags: MessageFlags.IsComponentsV2
            });
          }
        }

        break;
      case "disable":
        if (!pingdata)
          return await interaction.reply({
            content: `You **do not** have any **join pings** set up, cannot disable **nothing**..`,
            ephemeral: true,
          });
        else {
          if (!pingdata.Channel || pingdata.Channel === [])
            return await interaction.reply({
              content: `You have **already** disabled all your pings, no need to use **/join-ping disable**.`,
            });
          else {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `**🛠 Join Ping System**\n\n# > Wah, Slow DOWN!\n\n**• Warning**\n> This command will remove **ALL** join \n> pings, use **/join-ping remove** instead \n> if you are trying to disable a specific \n> one, otherwise click the confirm button!\n\n*🛠 WARNING!*`
              )
            );

            const buttons = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("confirm")
                .setLabel("✅ Confirm")
                .setStyle(ButtonStyle.Success),

              new ButtonBuilder()
                .setCustomId("decline")
                .setLabel("❌ Cancel")
                .setStyle(ButtonStyle.Danger)
            );

            const msg = await interaction.reply({
              components: [buttons],
            });
            const collector = msg.createMessageComponentCollector();

            collector.on("collect", async (i) => {
              if (i.customId === "confirm") {
                if (i.user.id !== executer)
                  return await i.reply({
                    content: `You **cannot** use these buttons!`,
                    ephemeral: true,
                  });
                await pingschema.deleteMany({ Guild: interaction.guild.id });
                await i.update({
                  embeds: [],
                  content: `**Successfuly** removed **ALL** join pings from your server.`,
                  components: [],
                });
              }

              if (i.customId === "decline") {
                if (i.user.id !== executer)
                  return await i.reply({
                    content: `You **cannot** use these buttons!`,
                    ephemeral: true,
                  });
                await i.update({
                  embeds: [],
                  content: `**Operation** was cancelled.`,
                  components: [],
                });
              }
            });
          }
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
