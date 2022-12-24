const mongoose = require('mongoose');
const { userSchema } = require('./user');

const postSchema = new mongoose.Schema({
    description: {
        type: String
    },
    media: {
        type: [String]
    },
    owner: {
        type: userSchema
    },
    status: {
        type: String,
        default: 'private'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const Post = mongoose.model('Post', postSchema);

exports.Post = Post;
exports.postSchema = postSchema;
