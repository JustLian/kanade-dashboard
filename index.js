const Koa = require('koa');
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
const { getGuilds } = require('./apiRequests')

// Set up views and public folder
app.use(views(__dirname + '/views', {
    extension: 'ejs',
}));

app.use(serve(__dirname + '/public'));

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
            server_name: 'Выберите сервер'
        });
        return;
    }
    await renderSettings(ctx, page, guild_id, ...getApiCreds(ctx));
    // await ctx.render('dash_layout', { dash: await ctx.render('test_dashboard'), server_name: 'test_server' });
});

// Use the router middleware
app.use(router.routes());
app.use(router.allowedMethods());
app.use(authRoutes.routes());

// Start the server
app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});