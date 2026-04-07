const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  PermissionFlagsBits,
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("channel")
    .setDescription("Manage the channels of the discord server.")
    .addSubcommand((command) =>
      command
        .setName("nuke")
        .setDescription(
          "Deletes a channel and then clones it again (not a raid command)."
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("*The channel to nuke.")
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
              ChannelType.GuildVoice
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("*The reason for nuking the channel.")
            .setRequired(true)
            .setMaxLength(512)
        )
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("*Specify the channel type.")
            .addChoices(
              { name: `Text Channel`, value: `text` },
              { name: `Voice Channel`, value: `voice` },
              { name: `Announcement Channel`, value: `announcement` }
            )
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("send-message")
            .setDescription(
              "*Whether or not to send a message in the new channel."
            )
            .setRequired(true)
        )
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "nuke":
        {
          const { options, guild } = interaction;
          const channel = options.getChannel("channel");
          const Reason = options.getString("reason");
          const type = options.getString("type");

          const sendMSG = options.getBoolean("send-message");

          const channelID = await guild.channels.cache.get(channel.id);

          if (!channel) {
            const errorContainer = new ContainerBuilder();
            errorContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `:warning: | The channel specified does not exist.`
              )
            );

            return interaction.reply({
              components: [errorContainer],
              flags: MessageFlags.IsComponentsV2,
            });
          }

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("nukeConfirm")
              .setLabel("Confirm")
              .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
              .setCustomId("nukeCancel")
              .setLabel("Cancel")
              .setStyle(ButtonStyle.Danger)
          );

          const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("nukeConfirm")
              .setLabel("Confirm")
              .setStyle(ButtonStyle.Success)
              .setDisabled(true),

            new ButtonBuilder()
              .setCustomId("nukeCancel")
              .setLabel("Cancel")
              .setStyle(ButtonStyle.Danger)
              .setDisabled(true)
          );

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `:warning: | You are about to nuke the channel <#${channel.id}> and all data will be deleted. Please make a decision below.`
            )
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Reason:** ${Reason}\n**Type:** ${type} channel\n**Send Message:** ${sendMSG}`
            )
          );
          container.addActionRowComponents(row);

          const message = await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });

          const collector = message.createMessageComponentCollector({
            time: ms("10m"),
          });

          collector.on("collect", async (c) => {
            if (c.customId === "nukeConfirm") {
              if (c.user.id !== interaction.user.id) {
                const errorContainer = new ContainerBuilder();
                errorContainer.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    `:warning: | Only ${interaction.user.tag} can interact with these buttons.`
                  )
                );

                return await c.reply({
                  components: [errorContainer],
                  flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
              }

              const cancelContainer = new ContainerBuilder();
              cancelContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `:white_check_mark: | Nuking channel <#${channel.id}>...`
                )
              );
              cancelContainer.addActionRowComponents(disabledRow);

              await c.update({
                components: [cancelContainer],
                flags: MessageFlags.IsComponentsV2,
              });

              await guild.channels.delete(channelID);

              let newChannel;

              if (type === "text") {
                newChannel = await guild.channels
                  .create({
                    name: channel.name,
                    type: ChannelType.GuildText,
                    topic: channel.topic || null,
                    parent: channel.parent,
                  })
                  .catch((err) => {
                    const errorContainer = new ContainerBuilder();
                    errorContainer.addTextDisplayComponents(
                      new TextDisplayBuilder().setContent(
                        `:warning: | I cannot nuke the channel; please ensure that I have the *manage_channels* permission.`
                      )
                    );

                    return interaction.followUp({
                      components: [errorContainer],
                      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                    });
                  });

                if (sendMSG === true) {
                  const nukeContainer = new ContainerBuilder();
                  nukeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                      `:bomb: | This channel was nuked by ${interaction.user}.`
                    )
                  );
                  nukeContainer.addSeparatorComponents(new SeparatorBuilder());
                  nukeContainer.addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems(
                      new MediaGalleryItemBuilder().setURL(
                        "https://media3.giphy.com/media/oe33xf3B50fsc/giphy.gif"
                      )
                    )
                  );

                  await newChannel.send({
                    components: [nukeContainer],
                    flags: MessageFlags.IsComponentsV2,
                  });
                }
              }

              if (type === "voice") {
                newChannel = await guild.channels
                  .create({
                    name: channel.name,
                    type: ChannelType.GuildVoice,
                    parent: channel.parent,
                  })
                  .catch((err) => {
                    const errorContainer = new ContainerBuilder();
                    errorContainer.addTextDisplayComponents(
                      new TextDisplayBuilder().setContent(
                        `:warning: | I cannot nuke the channel; please ensure that I have the *manage_channels* permission.`
                      )
                    );

                    return interaction.followUp({
                      components: [errorContainer],
                      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                    });
                  });
              }

              if (type === "announcement") {
                newChannel = await guild.channels
                  .create({
                    name: channel.name,
                    type: ChannelType.GuildAnnouncement,
                    topic: channel.topic || null,
                    parent: channel.parent,
                  })
                  .catch((err) => {
                    const errorContainer = new ContainerBuilder();
                    errorContainer.addTextDisplayComponents(
                      new TextDisplayBuilder().setContent(
                        `:warning: | I cannot nuke the channel; please ensure that I have the *manage_channels* permission.`
                      )
                    );

                    return interaction.followUp({
                      components: [errorContainer],
                      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                    });
                  });

                if (sendMSG === true) {
                  const nukeContainer = new ContainerBuilder();
                  nukeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                      `:bomb: | This channel was nuked by ${interaction.user}.`
                    )
                  );

                  await newChannel.send({
                    components: [nukeContainer],
                    flags: MessageFlags.IsComponentsV2,
                  });
                }
              }
            }

            if (c.customId === "nukeCancel") {
              if (c.user.id !== interaction.user.id) {
                const errorContainer = new ContainerBuilder();
                errorContainer.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    `:warning: | Only ${interaction.user.tag} can interact with these buttons.`
                  )
                );

                return await c.reply({
                  components: [errorContainer],
                  flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
              }

              const cancelContainer = new ContainerBuilder();
              cancelContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `:white_check_mark: | The nuke request has been successfully cancelled.`
                )
              );
              cancelContainer.addActionRowComponents(disabledRow);

              await c.update({
                components: [cancelContainer],
                flags: MessageFlags.IsComponentsV2,
              });
            }
          });
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
