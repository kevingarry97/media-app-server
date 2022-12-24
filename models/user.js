const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const config = require('config');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ username: this.username, _id: this._id, email: this.email, isVerified: this.isVerified }, config.get('jwtPrivatekey'))
  return token;
}

const User = mongoose.model('User', userSchema);

exports.User = User;
exports.userSchema = userSchema;
