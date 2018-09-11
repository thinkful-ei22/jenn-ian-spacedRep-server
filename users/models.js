
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
  score: {type: Number, default: 0},
  head: {type: Number, default: 0},
  questions: [
    {
      question: {type: mongoose.Schema.Types.ObjectId, ref: 'Question'},
      memoryStrength: Number,
      next: Number
    }
  ],
});

UserSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.password;
  }
});

UserSchema.methods.serialize = function() {
  return {
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || '',
    score: this.score || 0,
    head: this.head ||0,
    questions: this.questions || []
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('User', UserSchema);
