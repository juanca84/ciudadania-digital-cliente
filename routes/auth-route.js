const router = require('express').Router();
const { ensureLoggedIn } = require('connect-ensure-login');

module.exports = (client, passport) => {
  // auth login
  router.get('/login', (req, res, next) => {
    passport.authenticate('oidc', {
      // scope: ['openid nombre documento_identidad fecha_nacimiento email celular'],
      scope: ['openid profile'],
    })(req, res, next);
  });

  router.get('/login/callback', (req, res, next) => {
    passport.authenticate('oidc', {
      // En este caso solo por el tema del popup se tiene esta vista close_ventana
      // si fuera solo el caso de redireccion bastaria poner un:
      // successRedirect: '/home',
      successRedirect: '/auth/close_ventana',
      failureRedirect: '/error',
    })(req, res, next);
  });

  router.get('/close_ventana', (req, res) => {
    res.render('loginRedirect');
  });

  // auth logout
  router.get('/logout', ensureLoggedIn('/'), (req, res) => {
    // handle with passport
    const idToken = req.user.tokenSet.id_token;
    req.log.info({ sub: req.user.subId, msg: 'Cerrando Sesion' });

    res.redirect(client.endSessionUrl({
      id_token_hint: idToken,
    }));
  });

  router.get('/logout/callback', (req, res) => {
    // handle with passport
    req.log.info({ sub: req.user.subId, msg: 'Callback Session' });

    req.logout();
    res.redirect('/');
  });

  return router;
};
