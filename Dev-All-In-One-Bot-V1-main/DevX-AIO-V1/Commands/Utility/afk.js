
const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } = require("discord.js");
const afkSchema = require("../../Schemas/afkschema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`afk`)
    .setDescription(`Go afk within your server`)
    .addSubcommand((command) =>
      command
        .setName("set")
        .setDescription(`Go afk within your server`)
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription(`The reason for going afk`)
            .setRequired(false)
        )
    )
    .addSubcommand((command) =>
      command.setName("remove").setDescription(`Remove afk within your server`)
    ),
  async execute(interaction, client) {
    const { options } = interaction;
    const sub = options.getSubcommand();

    const Data = await afkSchema.findOne({
      Guild: interaction.guild.id,
      User: interaction.user.id,
    });

    switch (sub) {
      case "set":
        if (Data) {
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`You are already afk within this server`)
          );
          return await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
            ephemeral: true,
          });
        } else {
          const message = options.getString("message") || "No reason provided";
          const nickname = interaction.member.nickname || interaction.user.username;
          
          await afkSchema.create({
            Guild: interaction.guild.id,
            User: interaction.user.id,
            Message: message,
            Nickname: nickname,
          });

          const name = `[AFK] ${nickname}`;
          await interaction.member.setNickname(`${name}`).catch((er) => {
            return;
          });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# AFK Status Set\n\n<:tickmark:1423012532104204449> You are now afk within this server!`)
          );
          container.addSeparatorComponents(new SeparatorBuilder());
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**Reason:** ${message}`)
          );

          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        }
        break;

      case "remove":
        if (!Data) {
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`You are not afk within this server`)
          );
          return await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
            ephemeral: true,
          });
        } else {
          const nick = Data.Nickname;
          await afkSchema.deleteMany({
            Guild: interaction.guild.id,
            User: interaction.user.id,
          });

          await interaction.member.setNickname(`${nick}`).catch((err) => {
            return;
          });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# AFK Status Removed\n\n<:tickmark:1423012532104204449> Your afk has been removed`)
          );

          await interaction.reply({ 
            components: [container], 
            flags: MessageFlags.IsComponentsV2,
            ephemeral: true 
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
