const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } = require("discord.js");
const reminderSchema = require("../../Schemas/remindSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reminder")
    .setDescription("Configure your reminders.")
    .addSubcommand((command) =>
      command
        .setName("set")
        .setDescription("Sets up a reminder for you.")
        .addStringOption((option) =>
          option
            .setName("reminder")
            .setDescription(
              "Specified reminder will be your reminder's reason."
            )
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("minutes")
            .setDescription(
              "Specify in how many minutes you want your reminder to be in."
            )
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(59)
        )
        .addIntegerOption((option) =>
          option
            .setName("hours")
            .setDescription(
              "Specify in how many hours you want your reminder to be in."
            )
            .setMinValue(0)
            .setMaxValue(23)
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName("days")
            .setDescription(
              "Specify in how many days you want your reminder to be in."
            )
            .setMinValue(0)
            .setMaxValue(31)
            .setRequired(false)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("cancel")
        .setDescription("Specified reminder will be cancelled.")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription(
              `Specified reminder will be cancelled. You must know the reminder's ID to do this.`
            )
            .setMinLength(1)
            .setMaxLength(30)
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("cancel-all")
        .setDescription("Cancels all currently active reminders.")
    ),

  async execute(interaction, client) {
    const sub = await interaction.options.getSubcommand();

    switch (sub) {
      case "set":
        const { options, guild } = interaction;
        const reminder = options.getString("reminder");
        const minute = options.getInteger("minutes") || 0;
        const hour = options.getInteger("hours") || 0;
        const days = options.getInteger("days") || 0;

        let letter = [
          "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
          "a", "A", "b", "B", "c", "C", "d", "D", "e", "E",
          "f", "F", "g", "G", "h", "H", "i", "I", "j", "J",
          "k", "K", "l", "L", "m", "M", "n", "N", "o", "O",
          "p", "P", "q", "Q", "r", "R", "s", "S", "t", "T",
          "u", "U", "v", "V", "w", "W", "x", "X", "y", "Y",
          "z", "Z",
        ];

        let id = '';
        for (let i = 0; i < 16; i++) {
          id += letter[Math.floor(Math.random() * letter.length)];
        }

        let time =
          Date.now() +
          days * 1000 * 60 * 60 * 24 +
          hour * 1000 * 60 * 60 +
          minute * 1000 * 60;

        await reminderSchema.create({
          User: interaction.user.id,
          Time: time,
          Remind: reminder,
          ID: id,
        });

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# 🔔 Reminder System\n**Reminder Set**`)
        );
        container.addSeparatorComponents(new SeparatorBuilder());
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Time:** <t:${Math.floor(time / 1000)}:R>\n**Reminder:** ${reminder}\n**Reminder ID:** \`${id}\``)
        );

        await interaction.reply({ 
          components: [container], 
          flags: MessageFlags.IsComponentsV2 
        });

        break;
      case "cancel":
        const cancelId = await interaction.options.getString("id");

        const data = await reminderSchema.findOne({
          User: interaction.user.id,
          ID: cancelId,
        });

        if (!data) {
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`No **reminder** found with the **ID** of "**${cancelId}**"!`)
          );
          return await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
            ephemeral: true,
          });
        } else {
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# 🔔 Reminder Cancelled\n\nYour **reminder** with the **ID** of "**${cancelId}**" has been **cancelled**!`)
          );
          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
            ephemeral: true,
          });

          await reminderSchema.deleteMany({
            User: interaction.user.id,
            ID: cancelId,
          });
        }

        break;
      case "cancel-all":
        const alldata = await reminderSchema.find({
          User: interaction.user.id,
        });

        if (!alldata || alldata.length === 0) {
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`You **have not** set up any **reminders** yet!`)
          );
          return await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
            ephemeral: true,
          });
        } else {
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# 🔔 All Reminders Cancelled\n\n**All** of your **reminders** have been **cancelled**!`)
          );
          await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
            ephemeral: true,
          });

          await reminderSchema.deleteMany({ User: interaction.user.id });
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
