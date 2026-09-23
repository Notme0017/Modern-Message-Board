require("dotenv").config();
const express = require("express");
const path = require("node:path");
const session = require("express-session");
const passport = require('./controllers/passportController');
const pgSession = require(`connect-pg-simple`)(session);
const pool = require("./db/pool");

const indexRouter = require("./routes/indexRouter");
const messageRouter = require("./routes/messageRouter");

const app = express();

const assetPath = path.join(__dirname, "public");
app.use(express.static(assetPath));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));

app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'user_sessions',
    createTableIfMissing: true
  }),
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 30 * 1000} //30 seconds;
}));

app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) =>{
  res.locals.user = req.user || null;
  next();
});

app.use('/', indexRouter);
app.use('/message', messageRouter);

app.use((req, res) =>{
  res.status(404).send("Page not found! Sucker")
});

app.use((err, req, res, next) =>{
  console.error(err);
  res.status(err.statusCode||500).send(err. message || "something went wrong");
});

const PORT = 8080;
app.listen(PORT, (error) =>{
  if(error) throw error;
  console.log("Express listening on port: 8080!");
})