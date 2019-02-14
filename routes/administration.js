var express = require('express');
var router = express.Router();
var axios = require('axios');
const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_KEY || 'secret';
var moment = require('moment');

/* GET home page. */
router.get('/', function(req, res, next) {
  axios.get('http://localhost:3000/api/conferences').then( (conferences) => {
    console.log(req.cookies.token);
    jwt.verify(req.cookies.token, jwtKey, (err, decoded) => {
      const User = decoded;
      if (typeof(User) === "undefined" || User === null || User.isAdmin === false) res.redirect('/login')
      console.log(User);
      res.render('administration', { title: 'Administration', conferences: conferences.data, user: User, moment: moment });
    });
  })
});

/* GET conference detail. */
router.get('/add', function(req, res, next) {
  jwt.verify(req.cookies.token, jwtKey, (err, decoded) => {
    const User = decoded;
    if (typeof(User) === "undefined" || User === null || User.isAdmin === false) res.redirect('/login')
    console.log(User);
    res.render('add_conference', { title: 'Ajouter une conférence', user:User });
  });
});

/* GET conference detail. */
router.post('/add', function(req, res, next) {
  jwt.verify(req.cookies.token, jwtKey, (err, decoded) => {
    const User = decoded;
    if (typeof(User) === "undefined" || User === null || User.isAdmin === false) res.redirect('/login')
    axios.post(
      'http://localhost:3000/api/conferences/',
      req.body,
      {'headers': {'Authorization': 'Bearer ' + req.cookies.token}}
    ).then((response) => {
      res.redirect('/admin');
    }).catch((err) => {
      console.log(err);
      res.redirect('/admin');
    })
  });
});

/* GET conference detail. */
router.get('/delete/:id', function(req, res, next) {
  jwt.verify(req.cookies.token, jwtKey, (err, decoded) => {
    const User = decoded;
    if (typeof(User) === "undefined" || User === null || User.isAdmin === false) res.redirect('/login')
    axios.delete(
      'http://localhost:3000/api/conferences/'+ req.params.id
    ).then((response) => {
      res.redirect('/admin');
    }).catch((err) => {
      console.log(err);
      res.redirect('/admin');
    })
  });
});

/* GET conference detail. */
router.get('/register/:id', function(req, res, next) {
  jwt.verify(req.cookies.token, jwtKey, (err, decoded) => {
    const User = decoded;
    if (typeof(User) === undefined || User === null) res.redirect('/login')
    console.log('user id : ' + User.id);
    axios.patch(
      'http://localhost:3000/api/conferences/' + req.params.id,
      {
        "participants": [
          {
            "user_id": User.id
          }
        ]
      }
    ).then( (conference) => {
      res.redirect('/conferences')
    })
  });
});

module.exports = router;
