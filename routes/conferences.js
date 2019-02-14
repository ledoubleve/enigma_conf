module.exports = (io) => {
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
        if (typeof(User) === "undefined" || User === null) res.redirect('/login')
        console.log(User);
        res.render('conferences_list', { title: 'Liste des conférences', conferences: conferences.data, user: User, moment: moment });
      });
    })
  });
  
  /* GET conference detail. */
  router.get('/:id', function(req, res, next) {
    axios.get('http://localhost:3000/api/conferences/' + req.params.id).then( (conference) => {
      console.log(conference);
      jwt.verify(req.cookies.token, jwtKey, (err, decoded) => {
        const User = decoded;

        if (typeof(User) === "undefined" || User === null) res.redirect('/login')

        io.once('connection', function (socket) {
          socket.join('chat_' + conference.data._id);

          socket.on('chat_' + conference.data._id, function (msg) {
            io.to('chat_'+conference.data._id).emit('new_message_' + conference.data._id, User.name + ' : ' + msg);
          })

          socket.on('disconnect', function() {
            socket.leave('chat_' + conference.data._id);
          })
        })

        res.render('conference_detail', { title: conference.data.name, conference: conference.data, user: User, moment: moment });
      });
    })
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
  return router;
}
