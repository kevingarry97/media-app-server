const mongoose = require('mongoose');
const { postSchema } = require('./post');
const { userSchema } = require('./user');

const votedPost = new mongoose.Schema({
    post: {
        type: postSchema
    },
    voter: {
        type: userSchema
    },
    status: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const VotedPost = mongoose.model('VotedPost', votedPost);

exports.VotedPost = VotedPost;