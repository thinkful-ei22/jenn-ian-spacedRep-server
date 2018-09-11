'use strict';

const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');

const User = require('../users/models');
const Question = require('../questions/models');
const seedUsers = require('../db/users.json');
const seedQuestions = require('../db/questions.json');

console.log(`Connecting to mongodb at ${DATABASE_URL}`);
mongoose.connect(DATABASE_URL)
  .then(() => {
    console.info('Dropping Database');
    return mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    console.info('Seeding Database');
     User.insertMany(seedUsers);
     User.createIndexes();
  })
  .then(() => {
    console.info('Seeding Database');
    return Question.insertMany(seedQuestions);
  })
  .then(() => {
    console.info('Disconnecting');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    return mongoose.disconnect();
  });
