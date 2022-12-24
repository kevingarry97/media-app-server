const mongoose = require('mongoose');
const { userSchema } = require('./user')

const tokenSchema = new mongoose.Schema({
  user: {
    type: userSchema
  },
  token: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 43200
  }

});

const Tokens = mongoose.model('Tokens', tokenSchema);
exports.Tokens = Tokens;