const { 
  InteractionType, 
  ContainerBuilder, 
  TextDisplayBuilder, 
  SeparatorBuilder,
  MessageFlags 
} = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.type !== InteractionType.ModalSubmit) return;

    const modal = client.modals.get(interaction.customId);

    if (!modal) return;

    if (modal == undefined) return;

    if (
      modal.permission &&
      !interaction.member.permissions.has(modal.permission)
    ) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `You don't have the required permissions to use this.`
        )
      );
      
      return interaction.reply({
        components: [container],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
    }

    if (modal.developer && interaction.user.id !== `870179991462236170`) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `This modal is for developers only.`
        )
      );
      
      return interaction.reply({
        components: [container],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
    }

    modal.execute(interaction, client);
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
