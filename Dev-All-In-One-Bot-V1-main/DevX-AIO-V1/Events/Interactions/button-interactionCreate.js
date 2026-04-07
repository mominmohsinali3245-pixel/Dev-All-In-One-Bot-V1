const { ContainerBuilder, TextDisplayBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { interactionHandlers } = require("../../Commands/Setups/ytverify");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    // Handle YouTube verification buttons
    if (interaction.customId === "ytverify_disable" || interaction.customId === "ytverify_toggle") {
      await interactionHandlers.handleButtonInteraction(interaction, client);
      return;
    }

    // Handle music control buttons (riffy)
    if (['pause', 'play', 'skip', 'disconnect', 'np_back', 'np_loop', 'np_stop'].includes(interaction.customId)) {
      const player = client.riffy.players.get(interaction.guild.id);

      // Handle new music card buttons (np_*)
      if (interaction.customId.startsWith('np_')) {
        try {
          await interaction.deferUpdate();

          if (!player) {
            return interaction.followUp({
              content: `❌ No music player found for this server.`,
              ephemeral: true
            });
          }

          switch (interaction.customId) {
          case 'np_back':
            // Restart current track (seek to beginning)
            player.seek(0);
            await interaction.followUp({
              content: `⏮ **Track restarted**`,
              ephemeral: true
            });
            break;



          case 'np_stop':
            // Stop real-time updates for this guild
            if (client.musicCardGenerator) {
              client.musicCardGenerator.stopRealTimeUpdates(player.guildId);
            }

            player.destroy();
            await interaction.followUp({
              content: `⏹ **Stopped and disconnected**`,
              ephemeral: true
            });
            break;
        }
        } catch (error) {
          console.error('Error handling music button interaction:', error);
          try {
            if (!interaction.replied && !interaction.deferred) {
              await interaction.reply({
                content: `❌ An error occurred while processing your request.`,
                ephemeral: true
              });
            } else {
              await interaction.followUp({
                content: `❌ An error occurred while processing your request.`,
                ephemeral: true
              });
            }
          } catch (replyError) {
            console.error('Failed to send error message:', replyError);
          }
        }
        return;
      }

      // Handle music control buttons
      if (interaction.customId === 'pause') {
          await interaction.deferUpdate();

          if (!player) return interaction.followUp({ content: `❌ No music player found for this server.`, ephemeral: true });

          player.pause(true);

          await interaction.followUp({
            content: `⏸ **Paused**`,
            ephemeral: true
          });
          // Removed extraneous ephemeral: true
          const rowDisabled = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder()
                      .setCustomId('np_back')
                      .setStyle(ButtonStyle.Secondary)
                      .setEmoji('⏮')
                      .setDisabled(true),

                  new ButtonBuilder()
                      .setCustomId('pause')
                      .setStyle(ButtonStyle.Secondary)
                      .setEmoji('⏸')
                      .setDisabled(true),

                  new ButtonBuilder()
                      .setCustomId('skiped')
                      .setStyle(ButtonStyle.Success)
                      .setLabel('Skipped')
                      .setDisabled(true),

                  new ButtonBuilder()
                      .setCustomId('np_loop')
                      .setStyle(ButtonStyle.Secondary)
                      .setEmoji('🔁')
                      .setDisabled(true),

                  new ButtonBuilder()
                      .setCustomId('disconnect')
                      .setStyle(ButtonStyle.Danger)
                      .setEmoji('⏺')
                      .setDisabled(true)
              );

          return await interaction.message.edit({
              components: [rowDisabled]
          });
      } else if (interaction.customId === 'disconnect') {
          await interaction.deferUpdate();

          if (!player) return interaction.followUp({ content: `The player doesn't exist`, ephemeral: true });

          // Stop real-time updates for this guild
          if (client.musicCardGenerator) {
            client.musicCardGenerator.stopRealTimeUpdates(player.guildId);
          }

          player.destroy();

          const row = new ActionRowBuilder()
              .addComponents(
                  new ButtonBuilder()
                      .setCustomId('np_back')
                      .setStyle(ButtonStyle.Secondary)
                      .setEmoji('⏮')
                      .setDisabled(true),

                  new ButtonBuilder()
                      .setCustomId('play')
                      .setStyle(ButtonStyle.Secondary)
                      .setEmoji('▶')
                      .setDisabled(true),

                  new ButtonBuilder()
                      .setCustomId('disconnected')
                      .setStyle(ButtonStyle.Danger)
                      .setLabel('Disconnected')
                      .setDisabled(true),

                  new ButtonBuilder()
                      .setCustomId('np_loop')
                      .setStyle(ButtonStyle.Secondary)
                      .setEmoji('🔁')
                      .setDisabled(true),

                  new ButtonBuilder()
                      .setCustomId('skip')
                      .setStyle(ButtonStyle.Secondary)
                      .setEmoji('⏭')
                      .setDisabled(true)
              );

          return await interaction.message.edit({
              components: [row]
          });
      }
      return; // Return after handling music buttons
    }

    const button = client.buttons.get(interaction.customId);

    if (!button) return;

    if (button == undefined) return;

    if (button.cooldown) {
      //Cooldown check
      const currentMemberCooldown = client.cooldowns.get(
        `${interaction.user.id}-button-${interaction.customId}`
      );
      if (!currentMemberCooldown)
        client.cooldowns.set(
          `${interaction.user.id}-button-${interaction.customId}`,
          (Date.now() + button.cooldown).toString()
        );
      else if (parseInt(currentMemberCooldown) < Date.now())
        client.cooldowns.set(
          `${interaction.user.id}-button-${interaction.customId}`,
          (Date.now() + button.cooldown).toString()
        );
      else {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `You are on **cooldown try again <t:${Math.floor(
              parseInt(currentMemberCooldown) / 1000
            )}:R>**.`
          )
        );
        return interaction.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }
    }

    if (
      button.permission &&
      !interaction.member.permissions.has(button.permission)
    ) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `You don't have the required permissions to use this.`
        )
      );
      return interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }

    if (button.developer && interaction.user.id !== "YOUR_DISCORD_ID") {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `This button is for developers only.`
        )
      );
      return interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }

    button.execute(interaction, client);
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
