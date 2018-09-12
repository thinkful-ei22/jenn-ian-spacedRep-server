
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Question = require('../questions/models');

mongoose.Promise = global.Promise;

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''},
  questionsAnswered: {type: Number, default: 0},
  questionsCorrect: {type: Number, default: 0},
  head: {type: Number, default: 0},
  feedback: Boolean,
  questions: [
    {
      spanish: String,
      english: String,
      memoryStrength: Number,
      next: Number,
      correctCount: {type: Number, default: 0},
      incorrectCount: {type: Number, default: 0},
    }
  ],
});

UserSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret.password;
  }
});

UserSchema.methods.serialize = function() {
  return {
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || '',
    questionsAnswered: this.questionsAnswered || 0,
    questionsCorrect: this.questionsCorrect || 0,
    _id: this._id
    // head: this.head ||0,
    // questions: this.questions || [],
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('User', UserSchema);
