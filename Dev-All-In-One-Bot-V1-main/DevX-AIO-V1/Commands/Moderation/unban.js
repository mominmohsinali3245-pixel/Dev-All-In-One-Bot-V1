const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    messageLink,
  } = require("discord.js");
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("unban")
      .setDescription("Unbans a member from your server")
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
      .addStringOption((options) =>
        options
          .setName("id")
          .setDescription("ID of the user to unban")
          .setRequired(true)
      )
      .addStringOption((options) =>
        options
          .setName("reason")
          .setDescription("Specify a reason")
          .setMaxLength(512)
      ),
  
    /**
     *
     * @param { ChatInputCommandInteraction } interaction
     * @param { Client } client
     */
    async execute(interaction, client) {
      try {
        const { options, member, guild } = interaction;
        const reason = options.getString("reason") || "Not specified";
        const target = options.getString("id");
        await interaction.guild.members.unban(target);
        const container = new ContainerBuilder()
          .addTextDisplay(
            new TextDisplayBuilder()
              .setTitle("Ban Issues")
              .setDescription(
                [`<@${target}> got unbanned by ${member}`, `Reason: ${reason}`].join("\n")
              )
          );
        interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        target.send({
          content: `Hi, You have been unbanned from ${guild.name} for reason ${reason}, now you can join again`,
        });
      } catch (err) {
        return interaction.reply({
          content: "Enter a valid id for the banned user!",
        });
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
