async function loadModals(client) {
  const { loadFiles } = require("../Functions/fileLoader");
  
  const Files = await loadFiles("Modals");
  let count = 0;
  
  Files.forEach((file) => {
    const modal = require(file);
    if (!modal.id) return;

    client.modals.set(modal.id, modal);
    count++;
  });
  
  // Silent loading - will be reported in ready event
}
  
module.exports = { loadModals };

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
