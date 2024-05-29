const express = require('express');
const { engine } = require('express-handlebars');
const router = require('./api/router'); // Import correct du routeur
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const path = require('path');
const config = require('./config');

const app = express();
const port = 3000;



app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');

app.use('/css', express.static(path.join(__dirname, 'assets/css')));
app.use('/js', express.static(path.join(__dirname, 'assets/js')));
app.use(express.static(path.join(__dirname, 'assets')));

try {
  config.sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

const Handlebars = require('handlebars');
const MomentHandler = require('handlebars.moment');
MomentHandler.registerHelpers(Handlebars);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 3600000 },
  store: new SequelizeStore({ db: config.sequelize }),
  proxy: true,
}));

app.use('*', (req, res, next) => {
  if (req.session.firstname) {
    res.locals.firstname = req.session.firstname;
  }
  next();
});

app.use('/', router); // Utilisation correcte du routeur
app.use('/article_create', router);

app.listen(port, () => {
  console.log(`Example app listening on port http://127.0.0.1:${port}`);
});

