async function loadButtons(client) {
  const { loadFiles } = require("../Functions/fileLoader");

  const Files = await loadFiles("Buttons");
  let count = 0;

  Files.forEach((file) => {
    const button = require(file);
    if (!button.id) return;
    
    client.buttons.set(button.id, button);
    count++;
  });

  // Silent loading - will be reported in ready event
}

module.exports = { loadButtons };

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
