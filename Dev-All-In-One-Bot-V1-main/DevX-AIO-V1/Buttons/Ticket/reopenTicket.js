const { 
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
const Tickets = require("../../Schemas/Tickets");
const TicketSetup = require("../../Schemas/TicketSetup");

module.exports = {
  id: "open_ticket",
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

    if (TicketsDB.Closed == false)
      return i.reply({
        content: `> **Alert:** Ticket already open`,
        ephemeral: true,
      });

    await i.reply({
      content: `> **Alert:** You opened the ticket`,
      ephemeral: true,
    });

    const reopenContainer = new ContainerBuilder();
    reopenContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Ticket re-opened by ${member}.`
      )
    );

    channel.send({
      components: [reopenContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    channel.edit({ parent: TicketSetupDB.OpenCategoryID });
    message.delete(TicketsDB.MessageID);
    TicketsDB.MembersID.forEach((m) => {
      channel.permissionOverwrites.edit(m, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });
    });

    await Tickets.findOneAndUpdate(
      {
        ChannelID: channel.id,
      },
      { Closed: false, Archived: false }
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
