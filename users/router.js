
const express = require('express');
const bodyParser = require('body-parser');

const User = require('./models');
const Question = require('../questions/models');
const router = express.Router();

const jsonParser = bodyParser.json();

// Post to register a new user
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Missing '${missingField}' in request body`,
      location: missingField
    });
  }

  const stringFields = ['username', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  // If the username and password aren't trimmed we give an error.  Users might
  // expect that these will work without trimming (i.e. they want the password
  // "foobar ", including the space at the end).  We need to reject such values
  // explicitly so the users know what's happening, rather than silently
  // trimming them and expecting the user to understand.
  // We'll silently trim the other fields, because they aren't credentials used
  // to log in, so it's less of a problem.
  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      // bcrypt truncates after 72 characters, so let's not give the illusion
      // of security by storing extra (unused) info
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let { username, password, firstName = '', lastName = '' } = req.body;
  // Username and password come in pre-trimmed, otherwise we throw an error
  // before this
  firstName = firstName.trim();
  lastName = lastName.trim();

  User.find({ username })
    .count()
    .then(count => {
      if (count > 0) {
        // There is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      // If there is no existing user, hash the password
      return User.hashPassword(password);
    })
    .then(hash => {
      return new User({
        username,
        password: hash,
        firstName,
        lastName,
      });
    })
    .then(user => {
      return Question.find()
        .then(questionList => ({ user, questionList }))
        .then(({ user, questionList }) => {
          user.questions = questionList.map((question, index) => ({
            spanish: question.spanish,
            english: question.english,
            memoryStrength: 1,
            next: index === questionList.length - 1 ? null : index + 1
          }));
          return user.save();
        });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: 'Internal server error' });
    });
});
// Never expose all your users like below in a prod application
// we're just doing this so we have a quick way to see
// if we're creating users. keep in mind, you can also
// verify this in the Mongo shell.
router.get('/', (req, res) => {
  return User.find()
    // .then(users => res.json(users.map(user => user.serialize())))
    .then(users => res.json(users))
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});


//we want this to return the first question in the users questions array
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  return User.findById(id)
    .then(user => {
      if (user) {
        let firstQuestion = user.questions[user.head];
        firstQuestion.english = 'no peeking';
        res.json(firstQuestion);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

router.put('/:id', (req, res, next) => {
  const userId = req.params.id;
  const { userAnswer } = req.body;
  User.findById(userId)
    .then(user => {
      let currentIndex = user.head;
      // console.log('currentIn', currentQuestion);
      const correctAnswer = user.questions[user.head].english;
      // console.log('correctAnswer=', correctAnswer);
      let answeredQuestion = user.questions[currentIndex];
      // console.log('answeredQuestion=', answeredQuestion);
      user.questionsAnswered++;
      if (userAnswer === correctAnswer) {
        // console.log('user got it right!');
        answeredQuestion.memoryStrength *= 2; 
        user.feedback = true;
        user.questionsCorrect++;
      } else {
        // console.log('user got it wrong');
        answeredQuestion.memoryStrength = 1;
        user.feedback = false;
      }
      user.head = answeredQuestion.next;
      // console.log(user.head);
      let currentQuestion = answeredQuestion;
      for(let i=0; i<answeredQuestion.memoryStrength; i++){
        const nextIndex = currentQuestion.next;
        currentQuestion = user.questions[nextIndex];
      }
      answeredQuestion.next = currentQuestion.next;
      currentQuestion.next = currentIndex;
      // console.log(currentQuestion);
      return user.save()
        .then(user => {
          let response = { 
            feedback: user.feedback,
            correctAnswer,
            questionsAnswered: user.questionsAnswered,
            questionsCorrect: user.questionsCorrect
          };
          res.json(response)
        });
    })
    .catch(err => next(err));
});
  

module.exports = { router };
