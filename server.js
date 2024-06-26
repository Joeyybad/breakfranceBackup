const express = require("express");
const { engine } = require("express-handlebars");
const router = require("./api/router");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const path = require("path");
const moment = require("moment");
const exphbs = require("express-handlebars");
const config = require("./config");
const app = express();
const port = 3000;

// Créez une instance de Handlebars avec les helpers
const hbs = exphbs.create({
  extname: ".hbs",
  helpers: {
    eq: (a, b) => a === b,
    or: (a, b) => a || b,
    and: (a, b) => a && b,
    formatDate: (date, format) => {
      return moment(date).format(format);
    },
    formatTime: (time, format) => {
      return moment(time, "HH:mm:ss").format(format);
    },
    formatDateTime: (dateTime, format) => {
      return moment(dateTime).format(format);
    },
  },
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

app.use("/css", express.static(path.join(__dirname, "assets/css")));
app.use("/js", express.static(path.join(__dirname, "assets/js")));
app.use(express.static(path.join(__dirname, "assets")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

try {
  config.sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,       // si passé à true s'assure que les cookies ne sont transmis que via des connexions sécurisées HTTPS
      maxAge: 3600000,     //durée de vie du cookie en millisecondes = 1 heure
      httpOnly: true       // Empêche l'accès au cookie via JavaScript côté client
    },
    store: new SequelizeStore({ db: config.sequelize }),
    proxy: true,
  })
);

app.use("*", (req, res, next) => {
  if (req.session.firstname) {
    res.locals.firstname = req.session.firstname;
  }
  if (req.session.isAdmin) {
    res.locals.isAdmin = true;
  } else {
    res.locals.isAdmin = false;
  }
  if (req.session.isModerator) {
    res.locals.isModerator = true;
  }
  next();
});

app.use("/", router);
app.use("/article_create", router);

app.listen(port, () => {
  console.log(`Example app listening on port http://127.0.0.1:${port}`);
});
