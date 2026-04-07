const {
  CommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
const blacklistDB = require("../../Schemas/blacklistSchema");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction, client, err) {
    if (
      !interaction.isChatInputCommand() &&
      !interaction.isContextMenuCommand()
    )
      return;

    try {
      const userData = await blacklistDB.findOne({
        userId: interaction.user.id,
      });
      const command = client.commands.get(interaction.commandName);

      if (!command)
        return interaction.reply({
          content: "This Command is OutDated",
          flags: [MessageFlags.Ephemeral],
        });

      // Blacklist check
      if (userData) {
        return interaction.reply({
          content: `**You are blacklisted from using this bot.**\nReason: **${userData.reason}**`,
          flags: [MessageFlags.Ephemeral],
        });
      }

      // Cooldown check
      const cooldownKey = `${interaction.user.id}-${interaction.commandName}`;
      if (client.cooldowns && client.cooldowns.has(cooldownKey)) {
        return interaction.reply({
          content: "Ayo! you have to wait for 2 seconds before using this command again!",
          flags: [MessageFlags.Ephemeral],
        });
      }

      // Owner only check
      if (
        command.ownerOnly &&
        interaction.user.id !== `${client.config.developerid}`
      ) {
        return interaction.reply({
          content: "Sorry, this command is only available to the bot owner.",
          flags: [MessageFlags.Ephemeral],
        });
      }

      // Server owner only check
      if (
        command.ServerOnly &&
        interaction.user.id !== interaction.guild.ownerId
      ) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "This command is only available to the owner of the Discord server."
          )
        );
        
        return interaction.reply({
          components: [container],
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        });
      }

      // Set cooldown
      if (!client.cooldowns) {
        client.cooldowns = new Map();
      }
      client.cooldowns.set(cooldownKey, Date.now());
      setTimeout(() => {
        client.cooldowns.delete(cooldownKey);
      }, 2000);

      // Execute command with proper error handling
      await command.execute(interaction, client);

    } catch (error) {
      console.error(`[Error_Handling] :: Unhandled Rejection/Catch`, error);
      
      // Try to respond to the interaction if it hasn't been replied to yet
      if (!interaction.replied && !interaction.deferred) {
        try {
          await interaction.reply({
            content: "An error occurred while executing this command.",
            flags: [MessageFlags.Ephemeral],
          });
        } catch (replyError) {
          console.error("Failed to reply to interaction:", replyError);
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
