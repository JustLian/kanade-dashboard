// authRoutes.js
const Router = require('koa-router');
const axios = require('axios');
const { getUserInfo, generateUserToken } = require('./apiRequests');

const router = new Router();

// Replace these with your Discord application credentials
const CLIENT_ID = process.env['CLIENT_ID'];
const CLIENT_SECRET = process.env['CLIENT_SECRET'];
const REDIRECT_URI = `http://${process.env.REDIR_URL}/auth/callback`; // Callback URL
const DISCORD_API = 'https://discord.com/api/v10'; // Discord API base URL

// Route for initiating the Discord OAuth2 flow
router.get('/auth', async (ctx) => {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=identify`;
    ctx.redirect(url);
});

// Route for handling the OAuth2 callback
router.get('/auth/callback', async (ctx) => {
    const code = ctx.query.code; // Access query parameters directly

    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token',
        new URLSearchParams({
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'grant_type': 'authorization_code',
            'redirect_uri': REDIRECT_URI,
            'code': code
        }),
        {
            headers:
            {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    )

    const accessToken = tokenResponse.data.access_token;

    // Fetch user information using the access token
    const userResponse = await axios.get(`${DISCORD_API}/users/@me`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const user = userResponse.data;

    // Store token and user ID in cookies (customize cookie options as needed)
    ctx.cookies.set('discord_token', accessToken);
    ctx.cookies.set('discord_user_id', user.id);

    const user_api_token = await generateUserToken(user.id);
    ctx.cookies.set('token', user_api_token);

    // Redirect or respond as needed
    ctx.redirect('/dashboard');
});

function requireLogin(ctx, next) {
    const discordToken = ctx.cookies.get('discord_token');
    const discordUserId = ctx.cookies.get('discord_user_id');

    if (discordToken && discordUserId) {
        // User is logged in; continue to the next middleware
        return next();
    } else {
        ctx.redirect('/login');
    }
}

module.exports = router;