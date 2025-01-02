const Koa = require('koa');
const app = new Koa();
const path = require('path');
const serve = require('koa-static');

const publicFiles = serve(path.join(__dirname, 'public'));
publicFiles._name = 'static /public';

app.use(publicFiles);
// response
app.use(ctx => {
  ctx.body = 'Hello Koa';
});

app.listen(3000);