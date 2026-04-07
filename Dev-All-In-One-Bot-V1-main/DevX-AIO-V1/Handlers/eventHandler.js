async function loadEvents(client) {
  const { loadFiles } = require("../Functions/fileLoader");

  await client.events.clear();

  const Files = await loadFiles("Events");
  let count = 0;

  Files.forEach((file) => {
    const event = require(file);

    const execute = (...args) => event.execute(...args, client);
    client.events.set(event.name, execute);

    if (event.rest) {
      if (event.once)
        client.rest.once(event.name, execute);
      else
        client.rest.on(event.name, execute);
    } else {
      if (event.once)
        client.once(event.name, execute);
      else
        client.on(event.name, execute);
    }
    count++;
  });

  // Silent loading - will be reported in ready event
}

module.exports = { loadEvents };

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
