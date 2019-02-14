const mongoose = require('mongoose');
const express = require('express')
const jwt = require('jsonwebtoken');
const checkAuth = require('./jwtmd');
const jwtKey = process.env.JWT_KEY || 'secret';
const app = express();
const Router = express.Router();
const Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/conferences', {
    useNewUrlParser: true
})

/* GET users listing. */
Router.get('/', function(req, res, next) {
  res.send('Welcome');
});

const Participant = mongoose.Schema({
    user_id: String,
    time: Number
})

const Conference = mongoose.model('Conference', {
    name: String,
    description: String,
    start: Date,
    end: Date,
    participants: [Participant]
})

const User = mongoose.model('User', {
    name: String,
    password: String,
    isAdmin: Boolean
})

User.find({
    name: 'vevedev'
}, (err, res) => {
    if (err) console.log(err)
    if (res.length === 0) {
        const admin = new User({
            name: 'vevedev',
            password: 'vevedev',
            isAdmin: true
        })
        admin.save().then(() => {
            console.log('admin saved')
        })
    }
})


// app.use(express.json());
// app.use(Router);

function createToken(req, res) {
    User.find({
        name: req.body.name
    }, (err, users) => {
        if (err) res.status(400).send(err)
        if (users.length == 0) res.status(404).send('User not found')
        if (users[0].password !== req.body.password) res.status(404).send('User not found')
        res.status(200).send(
            jwt.sign({
                    name: users[0].name,
                    id: users[0]._id,
                    isAdmin: users[0].isAdmin
                },
                jwtKey, {
                    expiresIn: '1h'
                }
            )
        )
    })
}

function getConferences(req, res) {
    Conference.find((err, Conferences) => {
        if (err) res.status(400).send(err)
        res.status(200).send(Conferences)
    })
}

function addConference(req, res) {
    let conference = new Conference({
        name: req.body.name,
        description: req.body.description,
        start: req.body.start,
        end: req.body.end,
        participants: req.body.participants
    })
    conference.save().then(() => {
        res.status(201).send(conference)
    }).catch(err => {
        res.status(400).send(err)
    })
}

function addUser(req, res) {
    let user = new User({
        name: req.body.name,
        password: req.body.password
    })
    user.save().then(() => {
        res.status(201).send(user)
    }).catch(err => {
        res.status(400).send(err)
    })
}

function getConference(req, res) {
    Conference.find({
        _id: req.params.id
    }, (err, Conferences) => {
        if (err) res.status(400).send(err)
        if (Conferences.length == 0) res.status(404).send('Not found')
        res.status(200).send(Conferences[0])
    })
}

function patchConference(req, res) {
    Conference.findById(req.params.id, (err, conference) => {
        for( let b in req.body ){

            if (b === "participants") {
                var already = false;

                for (var i = 0; i < conference[b].length; i++) {

                    if (conference[b][i]['user_id'] == req.body[b][0]["user_id"]) {
                        already = true;
                        if (typeof(conference[b][i]["time"]) === undefined) {
                            conference[b][i]["time"] = req.body[b][0]['time'];
                        } else {
                            conference[b][i]["time"] = conference[b][i]["time"] * 1 + req.body[b][0]['time'] * 1;
                        }
                        
                    }
                }
                if (already == false) {
                    participant = {
                        "user_id": req.body[b][0]["user_id"]
                    }
                    conference[b].push(participant);
                } 
            } else {
                conference[b] = req.body[b];
            }
        }
        conference.save();
        res.status(204).send(conference);
    })
}

function deleteConference(req, res) {
    Conference.findByIdAndDelete(req.params.id).then((Response, err) => {
        res.status(202).send('Deleted');
    })
}


Router.route('/auth').post(createToken);
Router.route('/users').post(addUser);
Router.route('/conferences').get(getConferences).post(checkAuth, addConference);
Router.route('/conferences/:id').get(getConference).patch(patchConference).delete(deleteConference);

module.exports = Router;
