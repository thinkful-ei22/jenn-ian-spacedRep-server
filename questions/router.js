
const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();
const jsonParser = bodyParser.json();
const Question = require('./models');
const User = require('../users/models');


router.get('/', (req, res, next) => {
  Question.find()
    .then(questions => res.json(questions))
    .catch(err => console.log(err));
});

// router.put('/', (req, res, next) => {
//     const {answeredCorrectly} = req.body;
//     if(answeredCorrectly){
//         //double the value of M...
//     } else {
//         //reset M to 1
//     }
// })

module.exports = {router};
