function prefixCommands(client) {
  const fs = require("fs");
  const path = require("path");
  let count = 0;

  const pCommandsPath = path.join(__dirname, '..', 'pCommands');
  const commandFolder = fs.readdirSync(pCommandsPath);
  for (const folder of commandFolder) {
    const commands = fs
      .readdirSync(path.join(pCommandsPath, folder))
      .filter((file) => file.endsWith(".js"));

    for (const file of commands) {
      const command = require(`../pCommands/${folder}/${file}`);

      if (command.name) {
        client.pcommands.set(command.name, command);
        count++;

        if (command.aliases && Array.isArray(command.aliases)) {
          command.aliases.forEach((alias) => {
            client.aliases.set(alias, command.name);
          });
        }
      }
    }
  }
  // Silent loading - will be reported in ready event
}

module.exports = { prefixCommands };

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
