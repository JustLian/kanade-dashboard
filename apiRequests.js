const axios = require('axios');
const { response } = require('express');


async function generateUserToken(uid) {
    return axios.post(process.env.API_URL + '/generateToken', {
            secret: process.env.API_SECRET,
            user_id: uid
        })
        .then((response) => {
            return response.data.token; // Return the value directly
        })
        .catch((error) => {
            console.error('Error requesting new token', error);
            throw error; // Rethrow the error to be caught at the caller's level
        });
}


async function getGuilds(apiKey, apiId) {
    return await axios.post(process.env.API_URL + '/checkGuilds', null, {
        headers: {
            apiKey: apiKey,
            apiId: apiId
        }
    })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.error('Error requesting guilds', error);
            throw error;
        });
}


async function getSettings(apiKey, apiId, guildId) {
    return await axios.post(process.env.API_URL + '/getGuildSettings', {
        guild_id: guildId
    }, {
        headers: {
            apiId: apiId,
            apiKey: apiKey
        }
    })
    .then((response) => {
        return response.data.result;
    })
    .catch((error) => {
        console.error('Error request guilds settings', error);
        throw error;
    })
}


async function getUserInfo(accessToken) {
    return await axios.get('https://discord.com/api/v10/users/@me', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            // Handle errors, such as authentication failure or API issues
            console.error('Error fetching userId:', error);
        });
}

module.exports = { getUserInfo, generateUserToken, getGuilds, getSettings };