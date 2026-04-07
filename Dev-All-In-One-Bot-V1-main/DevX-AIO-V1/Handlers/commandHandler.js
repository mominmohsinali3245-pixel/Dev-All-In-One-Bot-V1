async function loadCommands(client) {
  const { loadFiles } = require("../Functions/fileLoader");

  await client.commands.clear();
  
  let commandsArray = [];
  let loadedCount = 0;

  const Files = await loadFiles("Commands");
  
  for (const file of Files) {
    try {
      const resolvedPath = require.resolve(file);
      if (require.cache[resolvedPath]) {
        delete require.cache[resolvedPath];
      }
      
      const command = require(file);
      
      if (!command || !command.data || !command.data.name || !command.execute) {
        continue;
      }
      
      if (client.commands.has(command.data.name)) {
        continue;
      }
      
      if (!/^[a-z0-9_-]+$/i.test(command.data.name)) {
        continue;
      }
      
      client.commands.set(command.data.name, command);
      commandsArray.push(command.data.toJSON());
      loadedCount++;
    } catch (error) {
      console.error(`Error loading command from ${file}:`, error.message);
    }
  }

  try {
    if (commandsArray.length > 0) {
      await client.application.commands.set(commandsArray);
    }
  } catch (error) {
    console.error('Failed to register global commands:', error.message);
  }

  // Silent loading - will be reported in ready event
}

module.exports = { loadCommands };

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
