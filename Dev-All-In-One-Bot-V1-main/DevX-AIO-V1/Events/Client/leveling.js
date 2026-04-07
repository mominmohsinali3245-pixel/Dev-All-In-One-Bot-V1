const levelSchema = require('../../Schemas/levelSchema');
const levelUpChannelSchema = require('../../Schemas/levelUpChannelSchema');
const { Profile } = require('discord-arts');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        // Ignore bot messages and DMs
        if (message.author.bot || !message.guild) return;
        
        // XP cooldown (in milliseconds) - 60 seconds
        const xpCooldown = 60000;
        
        try {
            // Get or create user's level data
            let levelData = await levelSchema.findOne({ 
                userId: message.author.id, 
                guildId: message.guild.id 
            });
            
            if (!levelData) {
                levelData = new levelSchema({
                    userId: message.author.id,
                    guildId: message.guild.id,
                    xp: 0,
                    level: 1,
                    lastMessage: new Date(),
                    totalMessages: 0
                });
            }
            
            // Check if user is on cooldown
            const now = new Date();
            const timeSinceLastMessage = now - levelData.lastMessage;
            
            if (timeSinceLastMessage < xpCooldown) return;
            
            // Update last message time
            levelData.lastMessage = now;
            levelData.totalMessages += 1;
            
            // Calculate XP to give (random between 5-15 XP)
            const xpToGive = Math.floor(Math.random() * 11) + 5;
            const oldLevel = levelData.level;
            
            // Add XP
            levelData.xp += xpToGive;
            
            // Check for level up
            const xpNeeded = levelData.level * 100;
            if (levelData.xp >= xpNeeded) {
                levelData.xp -= xpNeeded;
                levelData.level++;
                
                // Get level-up channel settings
                let levelUpChannel = message.channel; // Default to current channel
                let customMessage = "🎉 Congratulations {user}! You've reached level {level}!";
                
                try {
                    const levelUpSettings = await levelUpChannelSchema.findOne({
                        guildId: message.guild.id
                    });
                    
                    if (levelUpSettings && levelUpSettings.enabled) {
                        const channel = message.guild.channels.cache.get(levelUpSettings.channelId);
                        if (channel) {
                            levelUpChannel = channel;
                            customMessage = levelUpSettings.customMessage;
                        }
                    }
                } catch (error) {
                    console.log('Error fetching level-up channel settings:', error);
                }
                
                // Replace variables in custom message
                const formattedMessage = customMessage
                    .replace(/{user}/g, message.author.toString())
                    .replace(/{level}/g, levelData.level.toString());
                
                // Create level up card using discord-arts
                try {
                    const levelUpCard = await new Profile(message.author.id, {
                        customBadges: ['./skull.png', './rocket.png', './crown.png'],
                        presenceStatus: message.member?.presence?.status || 'online',
                        badgesFrame: true,
                        customDate: 'LEVEL UP!',
                        moreBackgroundBlur: true,
                        backgroundBrightness: 100,
                        rankData: {
                            currentXp: levelData.xp,
                            requiredXp: levelData.level * 100,
                            rank: 1, // Default rank for level up
                            level: levelData.level,
                            barColor: '#00fefe',
                            levelColor: '#00fefe',
                            autoColorRank: true
                        }
                    });
                    
                    // Create level up embed with the card
                    const levelUpEmbed = {
                        color: 0x00ff00,
                        title: '🎉 Level Up!',
                        description: formattedMessage,
                        image: { url: 'attachment://levelup.png' },
                        fields: [
                            { name: 'XP Earned', value: `${xpToGive} XP`, inline: true },
                            { name: 'Total XP', value: `${levelData.xp} XP`, inline: true },
                            { name: 'Total Messages', value: levelData.totalMessages.toString(), inline: true }
                        ],
                        footer: { text: 'Keep chatting to earn more XP!' },
                        timestamp: new Date()
                    };
                    
                    // Send level up message with the card in the configured channel
                    await levelUpChannel.send({
                        embeds: [levelUpEmbed],
                        files: [{ attachment: levelUpCard, name: 'levelup.png' }]
                    });
                } catch (error) {
                    console.log('Error generating level up card:', error);
                    // Send text-only fallback
                    try {
                        await levelUpChannel.send({
                            content: formattedMessage,
                            embeds: [{
                                color: 0x00ff00,
                                title: '🎉 Level Up!',
                                fields: [
                                    { name: 'New Level', value: `${levelData.level}`, inline: true },
                                    { name: 'XP Earned', value: `${xpToGive} XP`, inline: true },
                                    { name: 'Total XP', value: `${levelData.xp} XP`, inline: true }
                                ],
                                footer: { text: 'Keep chatting to earn more XP!' },
                                timestamp: new Date()
                            }]
                        });
                    } catch (err) {
                        console.log('Could not send level up message:', err);
                    }
                }
                
                // The formattedMessage variable is already declared above, no need to redeclare it
                
                // Create level up embed with the card
                const levelUpEmbed = {
                    color: 0x00ff00,
                    title: '🎉 Level Up!',
                    description: formattedMessage,
                    image: { url: 'attachment://levelup.png' },
                    fields: [
                        { name: 'XP Earned', value: `${xpToGive} XP`, inline: true },
                        { name: 'Total XP', value: `${levelData.xp} XP`, inline: true },
                        { name: 'Total Messages', value: levelData.totalMessages.toString(), inline: true }
                    ],
                    footer: { text: 'Keep chatting to earn more XP!' },
                    timestamp: new Date()
                };
                
                // Send level up message with the card in the configured channel
                levelUpChannel.send({
                    embeds: [levelUpEmbed],
                    files: [{ attachment: levelUpCard, name: 'levelup.png' }]
                }).catch(err => {
                    console.log('Could not send level up message:', err);
                });
            }
            
            // Save the updated data
            await levelData.save();
            
            // Log XP gain (for debugging)
            console.log(`[LEVELING] ${message.author.tag} earned ${xpToGive} XP (Level ${levelData.level}, ${levelData.xp} XP total)`);
            
        } catch (error) {
            console.error('Error in leveling system:', error);
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
