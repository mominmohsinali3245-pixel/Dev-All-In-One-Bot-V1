const { SlashCommandBuilder } = require(`@discordjs/builders`);
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require(`discord.js`);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("snipe")
    .setDescription(`Snipes the last deleted message in the channel.`),
  async execute(interaction, client) {
    const msg = client.snipes.get(interaction.channel.id);
    if (!msg)
      return await interaction.reply({
        content: "I cant find any deleted messages!",
        ephemeral: true,
      });

    const ID = msg.author.id;
    const member = interaction.guild.members.cache.get(ID);
    const URL = member.displayAvatarURL();

    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# Sniped Messages! (${member.user.tag})`)
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(msg.content)
    );
    container.addSeparatorComponents(new SeparatorBuilder());
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`Member ID: ${ID}`)
    );

    if (msg.image)
      return await interaction.reply({
        content: "I cant find any deleted messages!",
        ephemeral: true,
      });
    await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
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
