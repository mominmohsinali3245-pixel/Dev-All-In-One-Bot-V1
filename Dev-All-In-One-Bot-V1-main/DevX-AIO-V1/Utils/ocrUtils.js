const Tesseract = require('tesseract.js');

/**
 * Extract text from an image using Tesseract OCR
 * @param {Buffer|string} imageBuffer - Buffer or URL of the image
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromImage(imageBuffer) {
    try {
        const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
            logger: m => {} // Optionally log progress
        });
        return text;
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('Failed to extract text from image');
    }
}

module.exports = { extractTextFromImage };

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
