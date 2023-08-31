const Koa = require("koa");
const app = new Koa();
const cors = require("@koa/cors");
const router = require("koa-router");
const session = require("koa-session");
const { bodyParser } = require("@koa/bodyparser");
const events = require("./events");

app.use(cors({ credentials: true }));
app.keys = ["some secret"];
app.use(session({ secure: true, sameSite: "none" }, app));
app.use(bodyParser());

app.use((ctx, next) => {
  if (!ctx.session.favourites) {
    ctx.session.favourites = {};
  }
  next();
});

const myRouter = router();
myRouter.get("/events", (ctx) => {
  const eventsWithFavourites = events.map((event) => {
    const newEvent = { ...event };
    newEvent.favourited = !!ctx.session.favourites[event.event_id];
    return newEvent;
  });
  ctx.body = JSON.stringify(eventsWithFavourites);
});

myRouter.post("/favourite/:id", (ctx) => {
  const isFavourited = ctx.request.body.favourited;
  if (isFavourited === undefined) {
    ctx.response.status = 400;
    ctx.response.body = "No favourited data found in body.";
  } else if (!ctx.params.id) {
    ctx.response.status = 400;
    ctx.response.body = "No id found in URL";
  } else {
    ctx.session.favourites[ctx.params.id] = isFavourited;
    ctx.response.body = { id: ctx.params.id, favourited: isFavourited };
  }
});

app.use(myRouter.routes()).use(myRouter.allowedMethods());

const port = process.env.PORT || 3000;
console.log("Now listening on port:", port);
app.listen(port);
