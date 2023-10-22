const Koa = require('koa');
const Router = require('@koa/router');
const views = require('koa-views');
const serve = require('koa-static');
const dotenv = require('dotenv').config();
const app = new Koa();
const router = new Router();
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

// Set up views and public folder
app.use(views(__dirname + '/views', {
    extension: 'ejs',
}));

app.use(serve(__dirname + '/public'));

// Define routes
router.get('/', async (ctx) => {
    await ctx.render('layout', { body: await ctx.render('home') }); // Renders the 'home' view
});

router.get('/dashboard', async (ctx) => {
    await ctx.render('dash_layout', { dash: '<h1>Hello world</h1>' }); // Renders the 'dashboard_layout' view with an empty body
});

router.get('/dashboard/section1', async (ctx) => {
    await ctx.render('dashboard_example_section', { body: 'This is the content for Dashboard Section 1.' });
});

// Use the router middleware
app.use(router.routes());
app.use(router.allowedMethods());

// Start the server
app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});