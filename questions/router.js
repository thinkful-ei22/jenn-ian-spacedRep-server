const express = require('express');

const router = express.Router();
const Question = require('./models');

router.get('/', (req, res, next) => {
  Question.find()
    .then(questions => res.json(questions))
    .catch(err => console.log(err));
});

module.exports = {router};
