const giveawayModel = require("../Schemas/giveawayschema.js");
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

class GiveawayManager {
  constructor(client) {
    this.client = client;
    this.giveaways = new Map();
    this.timers = new Map();
  }

  async init() {
    const giveaways = await giveawayModel.find({ ended: false }).lean();
    for (const giveaway of giveaways) {
      this.giveaways.set(giveaway.messageId, giveaway);
      this.scheduleEnd(giveaway);
    }
  }

  createGiveawayContainer(giveaway, ended = false) {
    const container = new ContainerBuilder();

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🎉 ${giveaway.prize}`)
    );

    container.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    );

    if (ended) {
      const winners = giveaway.winners || [];
      const winnerText = winners.length > 0 
        ? winners.map(w => `<@${w}>`).join(', ')
        : 'No valid entries';

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Winners:** ${winnerText}\n**Hosted by:** <@${giveaway.hostedBy}>`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `*Ended at <t:${Math.floor(giveaway.endAt / 1000)}:F>*`
        )
      );
    } else {
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `React with 🎉 to enter!\n**${giveaway.winnerCount}** winner(s)\n**Ends:** <t:${Math.floor(giveaway.endAt / 1000)}:R>\n**Hosted by:** <@${giveaway.hostedBy}>`
        )
      );
    }

    return container;
  }

  async start(channel, options) {
    const giveaway = {
      messageId: null,
      guildId: channel.guildId,
      channelId: channel.id,
      prize: options.prize,
      winnerCount: options.winnerCount,
      hostedBy: options.hostedBy.id,
      startAt: Date.now(),
      endAt: Date.now() + options.duration,
      ended: false,
      entries: [],
      winners: []
    };

    const container = this.createGiveawayContainer(giveaway);

    const message = await channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    await message.react('🎉');

    giveaway.messageId = message.id;

    await giveawayModel.create(giveaway);
    this.giveaways.set(message.id, giveaway);
    this.scheduleEnd(giveaway);

    const collector = message.createReactionCollector({
      filter: (reaction) => reaction.emoji.name === '🎉',
      dispose: true
    });

    collector.on('collect', async (reaction, user) => {
      if (user.bot) return;
      
      const storedGiveaway = await giveawayModel.findOne({ messageId: message.id });
      if (!storedGiveaway.entries.includes(user.id)) {
        await giveawayModel.updateOne(
          { messageId: message.id },
          { $push: { entries: user.id } }
        );
        const localGiveaway = this.giveaways.get(message.id);
        if (localGiveaway) {
          localGiveaway.entries.push(user.id);
        }
      }
    });

    collector.on('remove', async (reaction, user) => {
      if (user.bot) return;
      
      await giveawayModel.updateOne(
        { messageId: message.id },
        { $pull: { entries: user.id } }
      );
      const localGiveaway = this.giveaways.get(message.id);
      if (localGiveaway) {
        const index = localGiveaway.entries.indexOf(user.id);
        if (index > -1) {
          localGiveaway.entries.splice(index, 1);
        }
      }
    });

    return giveaway;
  }

  scheduleEnd(giveaway) {
    const timeLeft = giveaway.endAt - Date.now();
    if (timeLeft <= 0) {
      this.end(giveaway.messageId);
      return;
    }

    const timer = setTimeout(() => {
      this.end(giveaway.messageId);
    }, timeLeft);

    this.timers.set(giveaway.messageId, timer);
  }

  async end(messageId) {
    const giveaway = this.giveaways.get(messageId) || await giveawayModel.findOne({ messageId });
    
    if (!giveaway || giveaway.ended) return [];

    const channel = await this.client.channels.fetch(giveaway.channelId).catch(() => null);
    if (!channel) return [];

    const message = await channel.messages.fetch(messageId).catch(() => null);
    if (!message) return [];

    const storedGiveaway = await giveawayModel.findOne({ messageId });
    const entries = storedGiveaway?.entries || giveaway.entries || [];

    const winners = [];
    const validEntries = [...new Set(entries)];

    for (let i = 0; i < Math.min(giveaway.winnerCount, validEntries.length); i++) {
      const randomIndex = Math.floor(Math.random() * validEntries.length);
      winners.push(validEntries[randomIndex]);
      validEntries.splice(randomIndex, 1);
    }

    giveaway.winners = winners;
    giveaway.ended = true;

    await giveawayModel.updateOne(
      { messageId },
      { $set: { winners, ended: true } }
    );

    const endContainer = this.createGiveawayContainer(giveaway, true);

    await message.edit({
      components: [endContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    if (winners.length > 0) {
      const winnerText = winners.map(w => `<@${w}>`).join(', ');
      const congratsContainer = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# 🎉 Giveaway Ended!\n\n**Winners:** ${winnerText}\n**Prize:** ${giveaway.prize}`
          )
        );

      await channel.send({
        components: [congratsContainer],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    this.giveaways.delete(messageId);
    const timer = this.timers.get(messageId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(messageId);
    }

    return winners;
  }

  async edit(messageId, options) {
    const giveaway = this.giveaways.get(messageId) || await giveawayModel.findOne({ messageId });
    
    if (!giveaway) {
      throw new Error('Giveaway not found');
    }

    if (giveaway.ended) {
      throw new Error('Cannot edit an ended giveaway');
    }

    const updates = {};
    
    if (options.addTime) {
      updates.endAt = giveaway.endAt + options.addTime;
      giveaway.endAt = updates.endAt;
      
      const timer = this.timers.get(messageId);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(messageId);
      }
      this.scheduleEnd(giveaway);
    }

    if (options.newWinnerCount) {
      updates.winnerCount = options.newWinnerCount;
      giveaway.winnerCount = options.newWinnerCount;
    }

    if (options.newPrize) {
      updates.prize = options.newPrize;
      giveaway.prize = options.newPrize;
    }

    await giveawayModel.updateOne({ messageId }, { $set: updates });

    const channel = await this.client.channels.fetch(giveaway.channelId).catch(() => null);
    if (channel) {
      const message = await channel.messages.fetch(messageId).catch(() => null);
      if (message) {
        const container = this.createGiveawayContainer(giveaway);
        await message.edit({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }
    }

    return giveaway;
  }

  async reroll(messageId) {
    const giveaway = await giveawayModel.findOne({ messageId });
    
    if (!giveaway) {
      throw new Error('Giveaway not found');
    }

    if (!giveaway.ended) {
      throw new Error('Cannot reroll an active giveaway');
    }

    const entries = giveaway.entries || [];
    const previousWinners = giveaway.winners || [];
    const availableEntries = entries.filter(e => !previousWinners.includes(e));

    if (availableEntries.length === 0) {
      throw new Error('No valid entries to reroll');
    }

    const newWinners = [];
    const validEntries = [...availableEntries];

    for (let i = 0; i < Math.min(giveaway.winnerCount, validEntries.length); i++) {
      const randomIndex = Math.floor(Math.random() * validEntries.length);
      newWinners.push(validEntries[randomIndex]);
      validEntries.splice(randomIndex, 1);
    }

    await giveawayModel.updateOne(
      { messageId },
      { $set: { winners: newWinners } }
    );

    const channel = await this.client.channels.fetch(giveaway.channelId).catch(() => null);
    if (channel) {
      const message = await channel.messages.fetch(messageId).catch(() => null);
      if (message) {
        giveaway.winners = newWinners;
        const container = this.createGiveawayContainer(giveaway, true);
        await message.edit({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      const winnerText = newWinners.map(w => `<@${w}>`).join(', ');
      const rerollContainer = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# 🎉 Giveaway Rerolled!\n\n**New Winners:** ${winnerText}\n**Prize:** ${giveaway.prize}`
          )
        );

      await channel.send({
        components: [rerollContainer],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    return newWinners;
  }
}

module.exports = GiveawayManager;

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
