const Koa = require("koa");
const app = new Koa();
const cors = require("@koa/cors");
const router = require("koa-router");
const events = require("./events");

app.use(cors());

const myRouter = router();
myRouter.get("/events", (ctx) => {
  ctx.body = JSON.stringify(events);
});

app.use(myRouter.routes());

const port = process.env.PORT || 3000;
app.listen(port);
