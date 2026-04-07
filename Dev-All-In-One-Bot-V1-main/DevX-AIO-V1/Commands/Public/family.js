const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const marriageSchema = require('../../Schemas/marriageSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("family")
    .setDescription("Family Commands Lol Doesn't Makes Sense xD")
    .addSubcommand((command) =>
      command
        .setName("marry")
        .setDescription("Marry somebody")
        .addUserOption((opt) =>
          opt
            .setName("person")
            .setDescription("The person you want to marry")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command.setName("divorce").setDescription("Divorce your partner")
    )
    .addSubcommand((command) =>
      command
        .setName("relationships")
        .setDescription(
          "See who a user is married to, if they're married at all"
        )
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("User you're checking")
            .setRequired(false)
        )
    ),
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "marry":
        const schema = require('../../Schemas/marriageSchema');
        const user = interaction.options.getUser("person");
        if (user.bot)
          return await interaction.reply({
            content: "You cannot marry a bot?! weirdo!",
            ephemeral: true,
          });
        if (interaction.user.id === user.id)
          return await interaction.reply({
            content: "You can't marry yourself! Silly goose!",
            ephemeral: true,
          });
        const intUser = interaction.user;
        const intUserData = await marriageSchema.findOne({
          marriedUser: intUser.id,
        });
        const userData = await marriageSchema.findOne({ marriedUser: user.id });
        if (!intUserData) {
          if (!userData) {
            const container = new ContainerBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `# Do they accept?\n\n${intUser} Wants to marry you! Do you accept their proposal?`
                )
              );

            const accept = new ButtonBuilder()
              .setCustomId("accept")
              .setLabel("I do")
              .setStyle(ButtonStyle.Success);

            const deny = new ButtonBuilder()
              .setCustomId("no")
              .setLabel("I don't")
              .setStyle(ButtonStyle.Danger);
            const row = new ActionRowBuilder().addComponents(accept, deny);
            const msg = await interaction.reply({
              content: `${user}`,
              allowedMentions: {
                parse: ["users"],
              },
              components: [container, row],
              flags: MessageFlags.IsComponentsV2,
              fetchReply: true,
            });
            const collector = msg.createMessageComponentCollector();
            collector.on("collect", async (i) => {
              if (i.user.id !== user.id)
                return await i.reply({
                  content: `Only ${user} can use these buttons!`,
                  ephemeral: true,
                });
              if (i.customId === "accept") {
                const successContainer = new ContainerBuilder()
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                      `# Congratulations! 🎉\n\n${intUser} and ${user} are officially married!`
                    )
                  );

                accept.setDisabled(true);
                deny.setDisabled(true);

                await marriageSchema.create({
                  marriedUser: user.id,
                  marriedTo: intUser.id,
                });
                await marriageSchema.create({
                  marriedUser: intUser.id,
                  marriedTo: user.id,
                });

                await i.deferUpdate();
                await interaction.editReply({
                  components: [successContainer, row],
                  content: null,
                  flags: MessageFlags.IsComponentsV2,
                });
              }
              if (i.customId === "no") {
                const rejectContainer = new ContainerBuilder()
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                      `# 😔\n\n${user} Did not want to marry you!`
                    )
                  );

                accept.setDisabled(true);
                deny.setDisabled(true);

                await i.deferUpdate();
                await interaction.editReply({
                  components: [rejectContainer, row],
                  content: null,
                  flags: MessageFlags.IsComponentsV2,
                });
              }
            });
          } else {
            const container = new ContainerBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `# This person is already married!`
                )
              );

            await interaction.reply({ 
              components: [container], 
              flags: MessageFlags.IsComponentsV2 
            });
          }
        } else {
          const container = new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `# You're already married!`
              )
            );

          await interaction.reply({ 
            components: [container], 
            flags: MessageFlags.IsComponentsV2 
          });
        }
    }

    switch (sub) {
      case "divorce":
        const schema = require('../../Schemas/marriageSchema');
        const intUser = interaction.user;
        const userData = await marriageSchema.findOne({
          marriedUser: intUser.id,
        });
        if (!userData) {
          await interaction.reply({
            content: "You aren't married to anybody yet!",
            ephemeral: true,
          });
        } else {
          const marriedToID = userData.marriedTo;
          const container = new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `# Are you sure?\n\n${intUser}, are you sure you want to divorce <@${marriedToID}>? You can only re-marry if they accept.`
              )
            );
          const yes = new ButtonBuilder()
            .setCustomId("yes")
            .setLabel("Yes")
            .setStyle(ButtonStyle.Success);
          const no = new ButtonBuilder()
            .setCustomId("no")
            .setLabel("No")
            .setStyle(ButtonStyle.Danger);
          const row = new ActionRowBuilder().addComponents(yes, no);
          const msg = await interaction.reply({
            components: [container, row],
            flags: MessageFlags.IsComponentsV2,
          });
          const collector = msg.createMessageComponentCollector();
          collector.on("collect", async (i) => {
            if (!i.isButton()) return;
            if (i.user.id !== interaction.user.id) return await i.deferUpdate();
            if (i.customId === "yes") {
              const singleContainer = new ContainerBuilder()
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    `# You're single!\n\nYou divorced <@${marriedToID}> and now you're single! congratulations!`
                  )
                );
              yes.setDisabled(true);
              no.setDisabled(true);

              await marriageSchema.findOneAndDelete({
                marriedUser: marriedToID,
              });
              await marriageSchema.findOneAndDelete({
                marriedUser: interaction.user.id,
              });

              await i.deferUpdate();
              await interaction.editReply({
                components: [singleContainer, row],
                flags: MessageFlags.IsComponentsV2,
              });
            }

            if (i.customId === "no") {
              const choiceContainer = new ContainerBuilder()
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    `# Your choice 🤷\n\nYou decided not to divorce <@${marriedToID}>, nice..?`
                  )
                );
              yes.setDisabled(true);
              no.setDisabled(true);

              await i.deferUpdate();
              await interaction.editReply({
                components: [choiceContainer, row],
                flags: MessageFlags.IsComponentsV2,
              });
            }
          });
        }
    }

    switch (sub) {
      case "relationships":
        const schema = require('../../Schemas/marriageSchema');
        const user = interaction.options.getUser("user") || interaction.user;
        const data = await schema.findOne({ marriedUser: user.id });
        if (!data) {
          const container = new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `${user} isn't married to anybody!`
              )
            );

          await interaction.reply({ 
            components: [container], 
            flags: MessageFlags.IsComponentsV2 
          });
        } else {
          const container = new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `${user} is married to <@${data.marriedTo}>`
              )
            );

          await interaction.reply({ 
            components: [container], 
            flags: MessageFlags.IsComponentsV2 
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
