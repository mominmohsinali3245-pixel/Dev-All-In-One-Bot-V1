const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const Tickets = require("../../Schemas/Tickets");
const TicketSetup = require("../../Schemas/TicketSetup");

module.exports = {
  id: "archive_ticket",
  cooldown: 10000,
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, channel, member, message } = interaction;
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

    if (TicketsDB.Deleted == true)
      return i.reply({
        content: `> **Alert:** Ticket has deleted can't use any actions`,
        ephemeral: true,
      });

    if (TicketsDB.Archived == true)
      return i.reply({
        content: `> **Alert:** Ticket already archived`,
        ephemeral: true,
      });

    await i.reply({
      content: `> **Alert:** You archived the ticket`,
      ephemeral: true,
    });

    const archivedContainer = new ContainerBuilder();
    archivedContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Ticket archived by ${member}.`
      )
    );

    channel.send({
      components: [archivedContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    const supportContainer = new ContainerBuilder();
    supportContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `\`-\` Want to open the ticket again after you closed it press re-open\n\`-\` Want to delete the ticket press "Delete"!`
      )
    );

    const supportpanel = await channel.send({
      components: [
        supportContainer,
        new ActionRowBuilder().addComponents(
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

    channel.edit({ parent: TicketSetupDB.ArchiveCategoryID });
    message.delete(TicketsDB.MessageID);

    await Tickets.findOneAndUpdate(
      {
        ChannelID: channel.id,
      },
      { Archived: true, MessageID: supportpanel.id }
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
