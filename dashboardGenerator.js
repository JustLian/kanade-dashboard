const fs = require('fs');
const { getSettings } = require('./apiRequests');

// Specify the path to your JSON file
const filePath = './settings.json';

// Read the file
function readJsonFile() {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            try {
                const jsonData = JSON.parse(data);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        });
    });
}


async function renderSettings(page, guild_id, apiKey, apiId) {
    const guild_settings = await getSettings(apiKey, apiId, guild_id);
    console.log(guild_settings);
    
    readJsonFile()
    .then(data => {
        data.forEach(pg => {
            if (pg["id"] != page) {
                return;
            }

            

        });
    });
}


module.exports = { renderSettings };