const mongoose = require('mongoose');
const { postSchema } = require('./post');
const { userSchema } = require('./user');

const likedPostSchema = new mongoose.Schema({
    post: {
        type: postSchema
    },
    liker: {
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

const LikedPost = mongoose.model('LikedPost', likedPostSchema);

exports.LikedPost = LikedPost;