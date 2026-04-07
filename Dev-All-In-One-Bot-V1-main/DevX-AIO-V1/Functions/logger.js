/**
 * Simple logger function for the bot
 * @param {string} message - The message to log
 * @param {string} level - The log level (info, warn, error, debug)
 */
function logger(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch (level.toLowerCase()) {
        case 'error':
            console.error(formattedMessage);
            break;
        case 'warn':
        case 'warning':
            console.warn(formattedMessage);
            break;
        case 'debug':
            console.debug(formattedMessage);
            break;
        case 'info':
        default:
            console.log(formattedMessage);
            break;
    }
}

module.exports = { logger };

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
