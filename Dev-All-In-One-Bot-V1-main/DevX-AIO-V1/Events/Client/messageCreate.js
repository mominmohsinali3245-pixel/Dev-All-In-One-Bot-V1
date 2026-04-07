const { messageHandlers } = require("../../Commands/Setups/ytverify");
const { checkAutomod } = require("../../Functions/automodHandler");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (
      message.author.bot ||
      !message.guild ||
      message.system ||
      message.webhookId
    )
      return;

    // Handle automod checks
    try {
      const automodTriggered = await checkAutomod(message, client);
      if (automodTriggered) return;
    } catch (error) {
      console.error('[MessageCreate] Automod error:', error);
    }

    // Handle YouTube verification (images uploaded in verification channel)
    try {
      await messageHandlers.processVerification(message, client);
    } catch (error) {
      console.error('[MessageCreate] YouTube verification error:', error);
    }

    // Handle prefix commands
    if (!message.content.startsWith(client.config.prefix)) return; //dont have to put the prefix in config, can input it manually.
    const args = message.content
      .slice(client.config.prefix.length)
      .trim()
      .split(/ +/);

    let cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;

    let command = client.pcommands.get(cmd);
    if (!command) command = client.pcommands.get(client.aliases.get(cmd));

    if (!command) return;
    
    if (command.owner && message.author.id !== '870179991462236170') return;

    if (command.args && !args.length) {
      return message.reply(`You didn't provide any arguments.`);
    }
    
    
    try {
      command.execute(message, client, args);
    } catch (error) {
      console.error(error);
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
