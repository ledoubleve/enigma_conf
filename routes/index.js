var express = require('express');
var router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_KEY || 'secret';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/conferences');
});

/* GET login. */
router.get('/login', function(req, res, next) {
  if (typeof(req.cookies.token) != 'undefined') {
    jwt.verify(req.cookies.token, jwtKey, (err, decoded) => {
      const User = decoded;
      if (typeof(User) !== undefined && User !== null) res.redirect('/conferences')
      res.render('login', { title: 'Connexion' });
   })
  } else {
    res.render('login', {title: 'Connexion'})
  }
  
});

/* GET login. */
router.get('/logout', function(req, res, next) {
  res.clearCookie('token');
  res.redirect('/login');
});

/* POST login. */
router.post('/login', function(req, res, next) {
  axios.post('http://localhost:3000/api/auth', {
      'name': req.body.login,
      'password': req.body.password
  }).then((response) => {
      res.cookie('token', response.data);
      res.redirect('/');
  })
})

module.exports = router;
