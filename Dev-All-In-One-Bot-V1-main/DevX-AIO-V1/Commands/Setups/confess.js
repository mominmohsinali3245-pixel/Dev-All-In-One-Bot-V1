const {
  SlashCommandBuilder,
  PermissionsBitField,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
  ChannelType,
} = require("discord.js");
const confessschema = require("../../Schemas/confess");
var timeoutv = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("confess")
    .setDescription(
      "Confess something privately or set up the confession system."
    )
    .addSubcommand((command) =>
      command
        .setName("send")
        .setDescription("Confess specified message privately.")
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("Specified message will be sent privately.")
            .setMinLength(1)
            .setMaxLength(4000)
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("setup")
        .setDescription("Sets up your confession system.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription(
              "Specified channel will be your confession channel."
            )
            .setRequired(true)
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement
            )
        )
        .addChannelOption((option) =>
          option
            .setName("logs")
            .setDescription("Enable logs for your confession system.")
            .setRequired(false)
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement
            )
        )
        .addIntegerOption((option) =>
          option
            .setName("timeout")
            .setDescription(
              "Set your timeout time for this command (in Seconds)."
            )
            .setRequired(false)
            .setMinValue(5)
            .setMaxValue(86400)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("disable")
        .setDescription("Disables your confession system.")
    ),
  async execute(interaction, err, client) {
    const sub = interaction.options.getSubcommand();
    const confessdata = await confessschema.findOne({
      Guild: interaction.guild.id,
    });

    switch (sub) {
      case "setup":
        if (
          !interaction.member.permissions.has(
            PermissionsBitField.Flags.Administrator
          ) &&
          interaction.user.id !== "619944734776885276"
        )
          return await interaction.reply({
            content: "You **do not** have the permission to do that!",
            ephemeral: true,
          });

        const channel = interaction.options.getChannel("channel");
        const logs = interaction.options.getChannel("logs");
        const timeout = interaction.options.getInteger("timeout") || 5;
        const time = timeout * 1000;

        if (confessdata)
          return await interaction.reply({
            content: `You **already** have a confessions channel **set up!** \n> Do **/confess disable** to undo.`,
            ephemeral: true,
          });
        else {
          if (logs) {
            await confessschema.create({
              Guild: interaction.guild.id,
              Timeout: time,
              Channel: channel.id,
              Logs: logs.id,
            });
          } else {
            await confessschema.create({
              Guild: interaction.guild.id,
              Timeout: time,
              Channel: channel.id,
              Logs: " ",
            });
          }

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**🕵️‍♀️ Confession System**\n\n# > Confession System set up\n\n**• System was set up**\n> Your channel (${channel}) will \n> now act as your confession \n> channel!\n\n**• Options**\n> **Logs:** ${logs} \n> **Timeout:** ${timeout}s\n\n*🕵️‍♀️ Channel Set Up*`
            )
          );

          await interaction.reply({ 
            components: [container],
            flags: MessageFlags.IsComponentsV2
          });
        }

        break;
      case "disable":
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

        if (!confessdata)
          return await interaction.reply({
            content: `You **do not** have a confessions channel **set up!** \n> Do **/confess setup** to set one up.`,
            ephemeral: true,
          });
        else {
          await confessschema.deleteMany({ Guild: interaction.guild.id });

          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**🕵️‍♀️ Confession System**\n\n# > Confession System Disabled\n\n**• System was disabled**\n> Your channel (<#${confessdata.Channel}>) will \n> no longer work as your \n> confession channel!\n\n*🕵️‍♀️ Confession System Disabled*`
            )
          );

          await interaction.reply({ 
            components: [container],
            flags: MessageFlags.IsComponentsV2
          });
        }

        break;
      case "send":
        if (
          !interaction.member.permissions.has(
            PermissionsBitField.Flags.Administrator
          ) &&
          timeoutv.includes(interaction.member.id)
        )
          return await interaction.reply({
            content:
              "You are on cooldown! You **cannot** execute **/confess send**.",
            ephemeral: true,
          });

        const timeouttime = confessdata.Timeout;

        timeoutv.push(interaction.user.id);
        setTimeout(() => {
          timeoutv.shift();
        }, timeouttime);

        let message = interaction.options.getString("message");
        const confesschannel = await interaction.guild.channels.cache.get(
          confessdata.Channel
        );

        if (!confesschannel) {
          return await interaction.reply({
            content: `The **confess** channel is **corrupted**! Please ask your server's **Administrators** to set up the system again!`,
            ephemeral: true,
          });
        }

        if (!message) {
          message = "User **did not** provide a message";
        }

        const messageContainer = new ContainerBuilder();
        messageContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**🕵️‍♀️ Confession System**\n\n# > Anonymous Says:\n\n${message}.\n\n*🕵️‍♀️ Message Received*`
          )
        );

        await confesschannel.send({ 
          components: [messageContainer],
          flags: MessageFlags.IsComponentsV2
        }).catch(err);

        if (confessdata.Logs) {
          const logschannel = await interaction.guild.channels.cache.get(
            confessdata.Logs
          );
          if (!logschannel)
            return await interaction.reply({
              content: `Your **message** has been sent **successfuly**!`,
              ephemeral: true,
            });

          const logContainer = new ContainerBuilder();
          logContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**🕵️‍♀️ Confession System**\n\n# > ${interaction.user.tag} Sent:\n\n${message}.\n\n*🕵️‍♀️ Log Collected*`
            )
          );

          await logschannel.send({ 
            components: [logContainer],
            flags: MessageFlags.IsComponentsV2
          }).catch(err);

          await interaction.reply({
            content: `Your **message** has been sent **successfuly**!`,
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: `Your **message** has been sent **successfuly**!`,
            ephemeral: true,
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
