const { 
  ContainerBuilder, 
  TextDisplayBuilder, 
  SeparatorBuilder,
  MessageFlags 
} = require("discord.js");
const changelogs = require("../../Schemas/changelogs");
const currentDate = new Date().toISOString();

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isModalSubmit()) return;

    const { customId, fields } = interaction;

    if (customId !== "changelogs") return;

    function isValidHexColor(str) {
      return /^#[0-9A-F]{6}$/i.test(str);
    }

    const title = fields.getTextInputValue("changelogs-title");
    const description = fields.getTextInputValue("changelogs-description");
    const footer = fields.getTextInputValue("changelogs-footer");
    const color = fields.getTextInputValue("changelogs-color");
    const type = fields.getTextInputValue("changelogs-type");

    changelogs.findOne({ date: currentDate }, (err, data) => {
      if (err) throw err;
      if (!data) {
        changelogs.create({
          date: Date.now(),
          config: {
            title: !title ? null : title,
            description: description,
            footer: !footer ? null : footer,
            color: isValidHexColor(color) ? color : null,
            type: !type ? null : type,
          },
        });
        
        const container = new ContainerBuilder();
        
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# 📍 Changelogs embed information`
          )
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**✏️ Title -** ${!title ? `${client.user.username} Changelogs` : title}\n\n**🧾 Description -** ${!description ? "A new changelogs is here!" : description}\n\n**📌 Footer -** ${!footer ? `${client.user.username} Changelogs` : `${footer}`} ${!type ? `| Bot` : `| ${type}`}\n\n**🎨 Color -** \`${!color ? "#ffffff" : color}\``
          )
        );
        
        return interaction.reply({ 
          components: [container], 
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] 
        });
      }
      if (data)
        return interaction.reply({
          content: `A changelog created in this second was found, wait at least one second before sending another one`,
          ephemeral: true,
        });
    });
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
