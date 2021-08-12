const express = require('express');
const bodyParser = require('body-parser');


const pino = require('pino');
const pinoPrint = require('pino-http-print');
const expressPino = require('express-pino-logger');

const prettyPrintFactory = pinoPrint({
  all: true,
  relativeUrl: true,
  translateTime: 'SYS:standard',
});

const prettyPrint = prettyPrintFactory();

const log = pino(prettyPrint);

const decode = require('jwt-claims');


// const router = require('express').Router();
const passport = require('passport');
const { Issuer, Strategy } = require('openid-client');
const expressSesssion = require('express-session');
const multer = require('multer');
const authRoute = require('./routes/auth-route');
const homeRoute = require('./routes/home-route');


require('dotenv').config();


const app = express();

const clientOidcUrl = process.env.OIDC_CLIENT_URL;
const clientOidcSettings = {
  client_id: process.env.OIDC_CLIENT_ID,
  response_type: 'code',
  redirect_uris: [process.env.OIDC_REDIRECT_URI],
  client_secret: process.env.OIDC_CLIENT_SECRET,
  post_logout_redirect_uris: [process.env.OIDC_POST_LOGOUT_REDIRECT_URI],
  token_endpoint_auth_method: 'client_secret_basic',
};

const expressSesssionSettings = {
  secret: process.env.SESSION_SECRET,
  resave: process.env.SESSION_RESAVE,
  saveUninitialized: process.env.SESSION_SAVE_UNINITIALIZED,
};

Issuer.discover(clientOidcUrl)
  .then((criiptoIssuer) => {
    const client = new criiptoIssuer.Client(clientOidcSettings);

    // ========> MIDLEWARE

    // set view engine
    app.set('view engine', 'ejs');
    app.use(express.static('public'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(expressPino({ logger: log }));

    log.info(`idClient: ${client.metadata.client_id}`);


    const upload = multer({});

    app.use(
      expressSesssion(expressSesssionSettings),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
      'oidc',
      new Strategy({ client }, (tokenSet, userinfo, done) => {
        const claims = decode(tokenSet.id_token);

        const user = {
          tokenSet,
          subId: claims.sub,
        };

        return done(null, user);
      }),
    );

    passport.serializeUser((user, done) => {
      // console.log('Serialize', user);
      log.info({ sub: user.subId });
      done(null, user);
    });
    passport.deserializeUser((user, done) => {
      // console.log('Deserialize', user);
      done(null, user);
    });

    // ========> ROUTES

    app.use('/', homeRoute(criiptoIssuer));
    app.use('/auth', authRoute(client, passport));


    // =========> BOOTSTRAP

    app.listen(process.env.PORT, () => {
      // Cambiar el console.log por log.INFO
      log.info(`port ${process.env.PORT} <(''<)  <(' ')>  (> '')>`);
    });
  }).catch((error) => {
    log.error(error);
  });


// ==========> EXPORT

module.exports = app;
