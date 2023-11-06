const fs = require('fs');
const { getSettings, getGuildInfo, getGuildChannels } = require('./apiRequests');

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
    const guildInfo = await getGuildInfo(guild_id);

    const channels = await getGuildChannels(apiKey, apiId, guild_id, "both");
    
    const [html, script] = await readJsonFile()
    .then(data => {
        let full_html = `
        <style>
        .container {
            display: flex;
            flex-wrap: wrap;
        }

        .category {
            width: 100%;
            margin-bottom: 1rem;
            display: flex;
            flex-wrap: wrap;
            border-bottom: 1px solid #ccc; /* Add a border (divider) below each category */
            padding-bottom: 1rem; /* Add spacing below the divider */
        }

        .item {
            width: 47.5%;
        }
        
        .item:nth-child(2n) {
            margin-left: 5%; /* Margin to every 2nd item within a category */
        }

        /* Media query for small screens */
        @media screen and (max-width: 768px) {
            .category {
                width: 100%;
                border: none; /* Remove border on small screens */
            }
            .item {
                width: 100%;
            }
        }
    </style>
        <div class="container" style="color: #d1e2e8;">
        <div class="row">`;
        let script = '<script>';
        data.forEach(pg => {
            if (pg["id"] != page) {
                return;
            }
            pg.categories.forEach(category => {
                const values = guild_settings[category.id];
                full_html += `
                <div class="category">
                <div class=item>
                    <h2>${category.title}</h2>
                </div>
                `

                category.options.forEach(opt => {
                    const id = `${category.id}-${opt.id}`

                    switch (opt.type) {

                        // checkbox option
                        case 'checkbox':
                            full_html += `
                            <div class="form-check item">
                                <input class="form-check-input" onclick="toggleCheck('${id}')" type="checkbox" id="${id}" ${values[opt.id] ? 'checked' : ''}>
                                <label class="form-check-label">
                                    ${opt.label}
                                </label>
                            </div>
                            `;
                            script += `setCheck("${id}", ${values[opt.id]});`;
                            break;

                        // text option
                        case 'text':
                            full_html += `
                            <div class="form-group item">
                                <label for="${id}">${opt.label}:</label>
                                <textarea class="form-control" id="${id}" placeholder="Enter text or number">${values[opt.id] !== null ? values[opt.id] : ''}</textarea>
                            </div>
                            `;
                            script += `fields.push("${id}");`;
                            break;
                        

                        // color option
                        case 'color':
                            full_html += `
                            <div class="form-group item">
                                <label>${opt.label}:</label>
                                <input type="color" class="form-control" id="${id}" value="${values[opt.id]}">
                            </div>
                            `;
                            script += `fields.push("${id}");`;
                            break;

                        case 'multicolor':
                            full_html += `
                            <div class="form-group item">
                                <label>${opt.label}:</label>
                            `;
                            for (let i = 1; i <= opt.amount; i++) {
                                full_html += `
                                    <input type="color" class="mb-1 form-control" id="${id}${i}" value="${values[opt.id + i]}">
                                `;
                                script += `fields.push("${id}${i}");`;
                            }
                            full_html += '</div>';
                            break;
                        
                        case 'channel':
                            full_html += `
                            <div class="form-group item">
                                <label>${opt.label}:</label>
                                <select id="${id}" class="channel-select" style="width: 100%">
                            `;

                            channels.forEach((data) => {
                                if (values[opt.id] == data[0]) {
                                    full_html += `<option selected="selected" value="${data[0]}">${data[1]}</option>`;
                                } else {
                                    full_html += `<option value="${data[0]}">${data[1]}</option>`;
                                }
                            });
                            
                            full_html += "</select></div>";
                            script += `fields.push("${id}");`;
                            break;
                        
                        default:
                            console.log('not implemented');

                    }

                })

                full_html += "</div>"
            })
            full_html += "</div></div>"
            script += `</script>`
        });
        return [full_html, script];
    });
    await ctx.render('dash_layout', { dash: html, server_name: guildInfo.name, img: guildInfo.img, additional: script, addButton: true })
}


module.exports = { renderSettings };