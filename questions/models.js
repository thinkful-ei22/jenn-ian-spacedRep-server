const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const questionSchema = new mongoose.Schema({
    spanish: String,
    english: String
});

questionSchema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id;
    }
  });

module.exports = mongoose.model('Question', questionSchema);