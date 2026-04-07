const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const levelSchema = require('../../Schemas/levelSchema');
const inviteSchema = require('../../Schemas/inviteSchema');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Display the XP leaderboard for this server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('level')
                .setDescription('Display the level XP leaderboard for this server')
                .addIntegerOption(option =>
                    option.setName('page')
                        .setDescription('Page number of the leaderboard')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(10)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('invites')
                .setDescription('Display the top server inviters leaderboard')
                .addIntegerOption(option =>
                    option.setName('page')
                        .setDescription('Page number of the leaderboard')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(10)
                )
        ),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'invites') {
            await interaction.deferReply();
            const page = interaction.options.getInteger('page') || 1;
            const usersPerPage = 10;
            
            try {
                // Get real invite data from the database
                let inviteData = await inviteSchema.findOne({ guildId: interaction.guild.id });
                
                // If no invite data exists, create empty data structure
                if (!inviteData) {
                    inviteData = new inviteSchema({
                        guildId: interaction.guild.id,
                        invites: []
                    });
                    await inviteData.save();
                }
                
                // Sort inviters by total invites (regular + bonus)
                const sortedInviters = inviteData.invites.sort((a, b) => (b.invites) - (a.invites));
                
                if (sortedInviters.length === 0) {
                    return await interaction.editReply({
                        content: 'No one has invited anyone to this server yet!'
                    });
                }
                
                // Calculate pagination
                const totalPages = Math.ceil(sortedInviters.length / usersPerPage);
                const startIndex = (page - 1) * usersPerPage;
                const endIndex = Math.min(startIndex + usersPerPage, sortedInviters.length);
                const leaderboardUsers = sortedInviters.slice(startIndex, endIndex);
                
                // Create canvas leaderboard image
                const canvas = createCanvas(800, 600);
                const ctx = canvas.getContext('2d');
                
                // Background gradient
                const gradient = ctx.createLinearGradient(0, 0, 0, 600);
                gradient.addColorStop(0, '#1a1a2e');
                gradient.addColorStop(1, '#16213e');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 800, 600);
                
                // Title
                ctx.fillStyle = '#00fefe';
                ctx.font = 'bold 36px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🏆 TOP INVITERS', 400, 60);
                
                // Server info
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '18px Arial';
                ctx.fillText(interaction.guild.name, 400, 90);
                
                // Draw leaderboard entries
                const startY = 140;
                const entryHeight = 40;
                
                for (let i = 0; i < Math.min(leaderboardUsers.length, 10); i++) {
                    const user = leaderboardUsers[i];
                    const member = await interaction.guild.members.fetch(user.userId).catch(() => null);
                    const position = startIndex + i + 1;
                    const y = startY + (i * entryHeight);
                    
                    // Background for entry
                    if (position <= 3) {
                        ctx.fillStyle = position === 1 ? 'rgba(0, 254, 254, 0.2)' :
                                       position === 2 ? 'rgba(0, 204, 204, 0.2)' :
                                       'rgba(0, 153, 153, 0.2)';
                        ctx.fillRect(50, y - 25, 700, 35);
                    }
                    
                    // Position number with medal
                    ctx.fillStyle = position <= 3 ? '#00fefe' : '#FFFFFF';
                    ctx.font = position <= 3 ? 'bold 20px Arial' : '18px Arial';
                    ctx.textAlign = 'left';
                    const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
                    ctx.fillText(medal, 70, y);
                    
                    // User avatar
                    try {
                        const avatarUrl = member?.user.displayAvatarURL({ extension: 'png', size: 64 }) ||
                                        'https://cdn.discordapp.com/embed/avatars/0.png';
                        const avatar = await loadImage(avatarUrl);
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(140, y - 10, 15, 0, Math.PI * 2);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(avatar, 125, y - 25, 30, 30);
                        ctx.restore();
                    } catch (error) {
                        // Fallback to default avatar
                        ctx.fillStyle = '#7289DA';
                        ctx.beginPath();
                        ctx.arc(140, y - 10, 15, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    
                    // Username
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '16px Arial';
                    const username = member ? member.user.username : user.username;
                    const truncatedUsername = username.length > 20 ? username.substring(0, 20) + '...' : username;
                    ctx.fillText(truncatedUsername, 170, y);
                    
                    // Invites breakdown
                    ctx.fillStyle = '#00fefe';
                    ctx.font = 'bold 14px Arial';
                    ctx.fillText(`${user.invites} total`, 400, y);
                    
                    ctx.fillStyle = '#00cccc';
                    ctx.font = '12px Arial';
                    ctx.fillText(`${user.regularInvites || 0} regular`, 400, y + 15);
                    
                    // Progress bar
                    const maxInvites = Math.max(...sortedInviters.map(u => u.invites));
                    const barWidth = (user.invites / maxInvites) * 200;
                    ctx.fillStyle = 'rgba(0, 254, 254, 0.2)';
                    ctx.fillRect(520, y - 15, 200, 20);
                    ctx.fillStyle = '#00fefe';
                    ctx.fillRect(520, y - 15, barWidth, 20);
                }
                
                // Footer with page info
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`Page ${page} of ${totalPages} • Total Inviters: ${sortedInviters.length}`, 400, 570);
                
                // Convert canvas to buffer
                const buffer = canvas.toBuffer('image/png');
                const attachment = new AttachmentBuilder(buffer, { name: 'inviter-leaderboard.png' });
                
                await interaction.editReply({
                    files: [attachment]
                });
                
            } catch (error) {
                console.error('Error in invites leaderboard command:', error);
                await interaction.editReply({
                    content: 'An error occurred while fetching the invites leaderboard.'
                });
            }
        }
        
        await interaction.deferReply();
        const page = interaction.options.getInteger('page') || 1;
        const usersPerPage = 10;
        
        try {
            // Get all users sorted by XP
            const allUsers = await levelSchema.find({ guildId: interaction.guild.id }).sort({ xp: -1 });
            
            if (allUsers.length === 0) {
                return await interaction.editReply({
                    content: 'No one has earned XP in this server yet!'
                });
            }
            
            // Calculate pagination
            const totalPages = Math.ceil(allUsers.length / usersPerPage);
            const startIndex = (page - 1) * usersPerPage;
            const endIndex = Math.min(startIndex + usersPerPage, allUsers.length);
            const leaderboardUsers = allUsers.slice(startIndex, endIndex);
            
            // Create canvas leaderboard image
            const canvas = createCanvas(800, 600);
            const ctx = canvas.getContext('2d');
            
            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, 600);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 800, 600);
            
            // Title
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🏆 XP LEADERBOARD', 400, 60);
            
            // Server info
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '18px Arial';
            ctx.fillText(interaction.guild.name, 400, 90);
            
            // Draw leaderboard entries
            const startY = 140;
            const entryHeight = 40;
            
            for (let i = 0; i < Math.min(leaderboardUsers.length, 10); i++) {
                const user = leaderboardUsers[i];
                const member = await interaction.guild.members.fetch(user.userId).catch(() => null);
                const username = member ? member.user.username : `Unknown User`;
                const position = startIndex + i + 1;
                const y = startY + (i * entryHeight);
                
                // Background for entry
                if (position <= 3) {
                    ctx.fillStyle = position === 1 ? 'rgba(255, 215, 0, 0.2)' :
                                   position === 2 ? 'rgba(192, 192, 192, 0.2)' :
                                   'rgba(205, 127, 50, 0.2)';
                    ctx.fillRect(50, y - 25, 700, 35);
                }
                
                // Position number with medal
                ctx.fillStyle = position <= 3 ? '#FFD700' : '#FFFFFF';
                ctx.font = position <= 3 ? 'bold 20px Arial' : '18px Arial';
                ctx.textAlign = 'left';
                const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
                ctx.fillText(medal, 70, y);
                
                // User avatar
                try {
                    const avatarUrl = member?.user.displayAvatarURL({ extension: 'png', size: 64 }) ||
                                    'https://cdn.discordapp.com/embed/avatars/0.png';
                    const avatar = await loadImage(avatarUrl);
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(140, y - 10, 15, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(avatar, 125, y - 25, 30, 30);
                    ctx.restore();
                } catch (error) {
                    // Fallback to default avatar
                    ctx.fillStyle = '#7289DA';
                    ctx.beginPath();
                    ctx.arc(140, y - 10, 15, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Username
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '16px Arial';
                const truncatedUsername = username.length > 20 ? username.substring(0, 20) + '...' : username;
                ctx.fillText(truncatedUsername, 170, y);
                
                // Level
                ctx.fillStyle = '#00FF00';
                ctx.font = '14px Arial';
                ctx.fillText(`Lvl ${user.level}`, 400, y);
                
                // XP
                ctx.fillStyle = '#FFD700';
                ctx.font = '14px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(`${user.xp.toLocaleString()} XP`, 720, y);
            }
            
            // Footer with page info
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Page ${page} of ${totalPages} • Total Users: ${allUsers.length}`, 400, 570);
            
            // Convert canvas to buffer
            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
            
            await interaction.editReply({
                files: [attachment]
            });
            
        } catch (error) {
            console.error('Error in leaderboard command:', error);
            await interaction.editReply({
                content: 'An error occurred while fetching the leaderboard.'
            });
        }
    }
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
