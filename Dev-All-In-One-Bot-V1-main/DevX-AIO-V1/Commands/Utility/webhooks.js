
const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("webhook")
    .setDMPermission(false)
    .setDescription("Manage and edit your webhooks.")
    .addSubcommand((command) =>
      command
        .setName("create")
        .setDescription("Creates a webhook for specified channel.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription(
              "Your webhook will be created in specified channel."
            )
            .addChannelTypes(
              ChannelType.GuildAnnouncement,
              ChannelType.GuildText,
              ChannelType.GuildVoice,
              ChannelType.GuildForum,
              ChannelType.GuildStageVoice
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription(`Specified name will be your new webhook's name.`)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(80)
        )
        .addStringOption((option) =>
          option
            .setName("icon-url")
            .setDescription(`Specified icon will be your new webhook's icon.`)
            .setMinLength(5)
            .setMaxLength(100)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("edit")
        .setDescription("Edits a webhook for you.")
        .addStringOption((option) =>
          option
            .setName("webhook-id")
            .setDescription("Specify the ID of your webhook.")
            .setMinLength(10)
            .setMaxLength(200)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("webhook-token")
            .setDescription("Specify the token of your webhook.")
            .setMinLength(10)
            .setMaxLength(200)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("new-name")
            .setDescription(
              `Specified name will be your webhook's updated name.`
            )
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(80)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("delete")
        .setDescription("Deletes a webhook for you.")
        .addStringOption((option) =>
          option
            .setName("webhook-id")
            .setDescription("Specify the ID of your webhook.")
            .setMinLength(10)
            .setMaxLength(200)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("webhook-token")
            .setDescription("Specify the token of your webhook.")
            .setMinLength(10)
            .setMaxLength(200)
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageWebhooks
      ) &&
      interaction.user.id !== "870179991462236170"
    ) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`You **do not** have the permission to do that!`)
      );
      return await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        ephemeral: true,
      });
    }

    switch (sub) {
      case "create":
        await interaction.deferReply({ ephemeral: true });

        const name = await interaction.options.getString("name");
        const icon =
          (await interaction.options.getString("icon-url")) ||
          "https://cdn.discordapp.com/attachments/1080219392337522718/1097891686241292348/images.png";
        const channel = await interaction.options.getChannel("channel");

        const webhook = await channel
          .createWebhook({
            name: name,
            avatar: icon,
            channel: channel,
          })
          .catch((err) => {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`**Oops!** Something went wrong, perhaps I am **missing permissions**.`)
            );
            return interaction.editReply({
              components: [container],
              flags: MessageFlags.IsComponentsV2,
            });
          });

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# 🔗 Webhook Tool\n**Webhook Created**`)
        );
        container.addSeparatorComponents(new SeparatorBuilder());
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Webhook Name:** ${name}\n**Webhook Channel:** ${channel}\n**Webhook URL:** https://discord.com/api/webhooks/${webhook.id}/${webhook.token}\n**Icon:** ${icon}`)
        );

        await interaction.editReply({ 
          components: [container], 
          flags: MessageFlags.IsComponentsV2 
        });

        try {
          await webhook.send({
            content: "Hello from your **brand new** webhook!",
          });
        } catch (err) {
          return;
        }

        break;
      case "edit":
        await interaction.deferReply({ ephemeral: true });

        const token = await interaction.options.getString("webhook-token");
        const id = await interaction.options.getString("webhook-id");
        let newname = await interaction.options.getString("new-name");

        const editwebhook = await interaction.guild.fetchWebhooks();

        await Promise.all(
          editwebhook.map(async (webhook) => {
            if (webhook.token !== token || webhook.id !== id) {
              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`🔍 **Searching**.. no **results** yet!`)
              );
              await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
              });
            } else {
              if (!newname) newname = webhook.name;
              let oldname = webhook.name;

              await webhook
                .edit({
                  name: newname,
                })
                .catch((err) => {
                  const container = new ContainerBuilder();
                  container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**Oops!** Something went wrong, perhaps I am **missing permissions**.`)
                  );
                  return interaction.editReply({
                    components: [container],
                    flags: MessageFlags.IsComponentsV2,
                  });
                });

              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# 🔗 Webhook Tool\n**Webhook Edited**`)
              );
              container.addSeparatorComponents(new SeparatorBuilder());
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Name:** ${oldname} **=>** ${newname}`)
              );

              await interaction.editReply({ 
                components: [container], 
                flags: MessageFlags.IsComponentsV2 
              });
            }
          })
        );

        break;
      case "delete":
        await interaction.deferReply({ ephemeral: true });

        const deltoken = await interaction.options.getString("webhook-token");
        const delid = await interaction.options.getString("webhook-id");

        const delwebhook = await interaction.guild.fetchWebhooks();

        await Promise.all(
          delwebhook.map(async (webhook) => {
            if (webhook.token !== deltoken || webhook.id !== delid) {
              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`🔍 **Searching**.. no **results** yet!`)
              );
              await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
              });
            } else {
              await webhook.delete().catch((err) => {
                const container = new ContainerBuilder();
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`**Oops!** Something went wrong, perhaps I am **missing permissions**.`)
                );
                return interaction.editReply({
                  components: [container],
                  flags: MessageFlags.IsComponentsV2,
                });
              });

              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`🚧 **Deleted** your webhook!`)
              );
              await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
              });
            }
          })
        );
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
