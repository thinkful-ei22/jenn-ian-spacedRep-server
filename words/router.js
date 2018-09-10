'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();
const jsonParser = bodyParser.json();
let {wordList} = require("./linked-list")


router.get('/', (req, res) => {
  res.json(wordList.head.value);
});

module.exports = {router};
