
const { interactionHandlers } = require("../../Commands/Setups/ytverify");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isAnySelectMenu()) return;

    const customId = interaction.customId;

    // Handle YouTube verification select menus
    if (customId === "ytverify_channel_select") {
      await interactionHandlers.handleChannelSelect(interaction, client);
    } else if (customId === "ytverify_role_select") {
      await interactionHandlers.handleRoleSelect(interaction, client);
    }

    // Handle other select menus here if needed
    // You can add more conditions for other select menu customIds
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
