const router = require('express').Router();


const { ensureLoggedIn } = require('connect-ensure-login');

const authLib = require('../lib/authLib');


module.exports = (issuer) => {
  router.get('/', (req, res) => {
    res.render('login');
  });

  router.get('/error', (req, res) => {
    res.render('error');
  });

  router.get('/home', ensureLoggedIn('/'), (req, res) => {
    const accessToken = req.user.tokenSet.access_token;
    const userInfoRoute = issuer.userinfo_endpoint;
    console.log('_______________________---', accessToken);
    authLib.getUserIdentity(userInfoRoute, accessToken)
      .then((respuestaIdentidadUsuario) => {
        const identity = respuestaIdentidadUsuario;
        req.log.info({
          sub: req.user.subId,
          msg: 'Datos de usuario recuperados',
        });
        res.render('home', { array: identity });
      }).catch((err) => {
        res.send(err);
      });
  });


  return router;
};
