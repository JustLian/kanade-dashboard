const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');
const views = require('koa-views');
const serve = require('koa-static');
const dotenv = require('dotenv').config();
const app = new Koa();
const router = new Router();
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";
const session = require('koa-session');

const authRoutes = require('./authRoutes');
const { requireLogin, getApiCreds } = require('./utilities');
const { renderSettings } = require('./dashboardGenerator')
const { getGuilds, updateGuildData } = require('./apiRequests')

// Set up views and public folder
app.use(views(__dirname + '/views', {
    extension: 'ejs',
}));

app.use(serve(__dirname + '/public'));
app.use(bodyParser());

// Define routes
router.get('/', async (ctx) => {
    await ctx.render('layout', { body: await ctx.render('home') }) // Renders the 'home' view
});

router.get('/dashboard', async (ctx) => {
    ctx.redirect('/dashboard/main');
});

router.get('/dashboard/:page', requireLogin, async (ctx) => {
    const { page } = ctx.params;
    const guild_id = ctx.cookies.get('guild_id');

    if (page == 'guilds' || guild_id == undefined) {
        const fetchedGuilds = await getGuilds(...getApiCreds(ctx));
        await ctx.render('dash_layout', {
            dash: await ctx.render('guilds', { guilds: fetchedGuilds }),
            server_name: 'Выберите сервер',
            img: 'https://cdn.discordapp.com/avatars/1088315782892625920/2f351a55584675d2b5e757a6ceaf782f.webp?size=300',
            additional: ""
        });
        return;
    }
    await renderSettings(ctx, page, guild_id, ...getApiCreds(ctx));
});

router.post('/updateData', requireLogin, async (ctx) => {
    const body = ctx.request.body;
    const res = await updateGuildData(...getApiCreds(ctx), ctx.cookies.get('guild_id'), body.data);
    return {
        'result': res
    };
})

// Use the router middleware
app.use(router.routes());
app.use(router.allowedMethods());
app.use(authRoutes.routes());

// Start the server
app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});