const { SlashCommandBuilder } = require('@discordjs/builders');
const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags, SeparatorSpacingSize, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB()
 
module.exports = {
    data: new SlashCommandBuilder()
    .setName('rep-stats')
    .setDescription('Check the reps and highest rating a user has')
    .setDMPermission(false)
    .addUserOption(option => option.setName('user').setDescription('The user you want to rep').setRequired(true)),
    
    async execute (interaction, client) {
        const user = interaction.options.getUser('user');
        const latest_rep_reason = await db.get(`latest_reason_${user.id}`) || '`None.`'
        const reps = await db.get(`reps_${user.id}`) || 0;
        const highest_rating = await db.get(`highest_rating_${user.id}`) || '**No stars**'
 
        const container = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# ${user.username}'s Rep Stats\n\n**Latest reason for rep:**\n${latest_rep_reason}\n\n**Highest Rating**\n${highest_rating}\n\n**Rep Count**\n${reps} reps`
          )
        );
 
        await interaction.reply({ 
          components: [container], 
          flags: MessageFlags.IsComponentsV2 
        })
    }
}

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
