const { glob } = require("glob");
const { promisify } = require("util");
const path = require("path");
const proGlob = promisify(glob);

async function loadFiles(dirName){
  try {
    const basePath = path.join(__dirname, '..').replace(/\\/g, "/");
    const pattern = `${basePath}/${dirName}/**/*.js`;

    const Files = await proGlob(pattern);

    Files.forEach((file) => {
      try {
        delete require.cache[require.resolve(file)];
      } catch (error) {
        // Silent error handling
      }
    });
    
    return Files;
  } catch (error) {
    return [];
  }
}

module.exports = { loadFiles };

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
