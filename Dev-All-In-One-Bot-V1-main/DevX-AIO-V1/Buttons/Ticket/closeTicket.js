const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const Tickets = require("../../Schemas/Tickets");
const TicketSetup = require("../../Schemas/TicketSetup");

module.exports = {
  id: "close_ticket",
  cooldown: 10000,
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, channel, member } = interaction;
    const i = interaction;

    const TicketSetupDB = await TicketSetup.findOne({
      GuildId: guild.id,
    });
    if (!TicketSetupDB) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Can't find any data on the ticket system:/`
        )
      );
      
      return i.reply({
        components: [container],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
    }

    const TicketsDB = await Tickets.findOne({
      GuildId: guild.id,
      ChannelID: channel.id,
    });
    if (!TicketsDB) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Can't find any data on this ticket:/`
        )
      );
      
      return i.reply({
        components: [container],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
    }

    if (!member.roles.cache.find((r) => r.id === TicketSetupDB.SupportRoleID)) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Your not allowed to use this action!`
        )
      );
      
      return i.reply({
        components: [container],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
    }

    if (TicketsDB.Closed == true)
      return i.reply({
        content: `> **Alert:** Ticket already closed`,
        ephemeral: true,
      });

    if (TicketsDB.Deleted == true)
      return i.reply({
        content: `> **Alert:** Ticket has deleted can't use any actions`,
        ephemeral: true,
      });

    await i.reply({
      content: `> **Alert:** You closed the ticket`,
      ephemeral: true,
    });

    const closedContainer = new ContainerBuilder();
    closedContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Ticket closed by ${member}.`
      )
    );

    channel.send({
      components: [closedContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    channel
      .edit({ parent: TicketSetupDB.ClosedCategoryID })
      .then(async (channel) => {
        TicketsDB.MembersID.forEach((m) => {
          channel.permissionOverwrites.edit(m, {
            ViewChannel: false,
            SendMessages: false,
            ReadMessageHistory: false,
          });
        });
      });

    const supportContainer = new ContainerBuilder();
    supportContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `\`-\` Want to save the ticket please press "Archive Ticket"\n\`-\` Want to open the ticket again after you closed it press re-open\n\`-\` Want to delete the ticket press "Delete"!`
      )
    );

    const supportpanel = await channel.send({
      components: [
        supportContainer,
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`archive_ticket`)
            .setLabel(`Archive Ticket`)
            .setEmoji("📦")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`open_ticket`)
            .setLabel(`Re-open`)
            .setEmoji("💬")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`delete_ticket`)
            .setLabel(`Delete`)
            .setEmoji("⛔")
            .setStyle(ButtonStyle.Danger)
        ),
      ],
      flags: MessageFlags.IsComponentsV2,
    });

    await Tickets.findOneAndUpdate(
      {
        ChannelID: channel.id,
      },
      { Closed: true, MessageID: supportpanel.id }
    );
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
