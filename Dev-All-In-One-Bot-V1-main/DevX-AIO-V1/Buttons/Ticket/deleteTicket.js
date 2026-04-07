const { 
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
const Tickets = require("../../Schemas/Tickets");
const TicketSetup = require("../../Schemas/TicketSetup");
const TicketCount = require("../../Schemas/TicketCount");
const { createTranscript } = require("discord-html-transcripts");

module.exports = {
  id: "delete_ticket",
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

    const TicketCountDB = TicketCount.findOne({ GuildID: guild.id });
    const Count = (await TicketCountDB.countDocuments()).toString();

    const TChannel = guild.channels.cache.get(TicketSetupDB.TranscriptID);

    const attachment = await createTranscript(channel, {
      limit: -1,
      returnType: "attachment",
      saveImages: true,
      minify: true,
      fileName: `Ticket-${TicketsDB.CreatorTag}-${Count}.html`,
    });

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
        content: `> **Alert:** Ticket already deleted`,
        ephemeral: true,
      });

    await i.reply({
      content: `> **Alert:** You deleted the ticket`,
      ephemeral: true,
    });

    await Tickets.findOneAndUpdate(
      {
        ChannelID: channel.id,
      },
      { Closed: true, Deleted: true, Archived: true }
    );

    const deleteContainer = new ContainerBuilder();
    deleteContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Ticket will be deleted in \`5\` seconds!`
      )
    );

    channel.send({
      components: [deleteContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    TicketsDB.MembersID.forEach((m) => {
      channel.permissionOverwrites.edit(m, {
        ViewChannel: false,
        SendMessages: false,
        ReadMessageHistory: false,
      });
    });

    const transcriptContainer = new ContainerBuilder();
    transcriptContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Data:**\n\`-\` **Ticket ID:** ${Count}\n\`-\` **Ticket Creator ID:** ${TicketsDB.CreatorID}\n\`-\` **Ticket Creator:** ${TicketsDB.CreatorTag}\n\`-\` **Ticket Created at:** ${TicketsDB.CreatedAt}\n\`-\` **Closed By:** ${member}`
      )
    );

    transcriptContainer.addSeparatorComponents(new SeparatorBuilder());

    transcriptContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Created at ${TicketsDB.CreatedAt}`
      )
    );

    TChannel.send({
      components: [transcriptContainer],
      files: [attachment],
      flags: MessageFlags.IsComponentsV2,
    });

    setTimeout(() => {
      Tickets.findOneAndDelete({
        GuildID: guild.id,
        ChannelID: channel.id,
      }).catch((err) => console.log(err));

      channel.delete();
    }, 5 * 1000);
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
