function requireLogin(ctx, next) {
    const discordToken = ctx.cookies.get('discord_token');
    const discordUserId = ctx.cookies.get('discord_user_id');

    if (discordToken && discordUserId) {
        // User is logged in; continue to the next middleware
        return next();
    } else {
        ctx.redirect('/auth');
    }
}


function getApiCreds(ctx) {
    const apiKey = ctx.cookies.get('token');
    const apiId = ctx.cookies.get('discord_user_id');

    return [ apiKey, apiId ];
}


module.exports = { requireLogin, getApiCreds };