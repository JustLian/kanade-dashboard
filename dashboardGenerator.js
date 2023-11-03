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


async function renderSettings(ctx, page, guild_id, apiKey, apiId) {
    const guild_settings = await getSettings(apiKey, apiId, guild_id);
    console.log(guild_settings);
    
    const html = await readJsonFile()
    .then(data => {
        console.log(data);
        let full_html = '';
        data.forEach(pg => {
            if (pg["id"] != page) {
                return;
            }
            pg.categories.forEach(category => {
                full_html += `
                <style> .category { margin-top: 20px; } </style>
                <div class="container" style="color: #d1e2e8;">
                <div class="row">
                <div class="col-md-6 col-lg-4">
                <div class="category">
                <h2>${category.title}</h2>
                `

                category.options.forEach(opt => {
                    const id = `${category.id}-${opt.id}`

                    switch (opt.type) {

                        // checkbox option
                        case 'checkbox':
                            full_html += `
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="${id}">
                                <label class="form-check-label" for="singleCheckbox">
                                    ${opt.label}
                                </label>
                            </div>
                            `;
                            break;

                        // text option
                        case 'text':
                            full_html += `
                            <div class="form-group">
                                <label for="textInput">${opt.label}:</label>
                                <input type="text" class="form-control" id="${id}" placeholder="Enter text or number">
                            </div>
                            `;
                            break;

                        // color option
                        case 'color':
                            full_html += `
                            <div class="form-group">
                                <label for="colorPicker">${opt.label}:</label>
                                <input type="color" class="form-control" id="${id}">
                            </div>
                            `;
                            break;

                        case 'multicolor':
                            full_html += `
                            <div class="form-group">
                                <label for="colorPicker">${opt.label}:</label>
                            `;
                            for (let i = 1; i <= opt.amount; i++) {
                                full_html += `
                                    <input type="color" class="mb-1 form-control" id="${id}${i}">
                                `;
                            }
                            full_html += '</div>';
                            break;
                        
                        default:
                            console.log('not implemented');

                    }

                })

                full_html += "</div></div>"
            })
        });
        return full_html;
    });
    await ctx.render('dash_layout', { dash: html, server_name: "test" })
}


module.exports = { renderSettings };