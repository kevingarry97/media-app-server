const express = require('express');
const auth = require('../middleware/auth');
const { Post } = require('../models/post');
const { VotedPost } = require('../models/votedPost');
const router = express.Router();

router.get('/voted/post', async (req, res) => {
    const votedPosts = await VotedPost.find();
    if (!votedPosts) return res.status(404).json({message: 'No Voted Posts Found!!'});

    res.status(200).send(votedPosts);
});

router.post('/vote/post', auth, async (req, res) => {

    const post = await Post.findOne({"_id": req.body.post_id})
    if (!post) return res.status(404).send({message: 'No Post Found'});

    let votedPost = await VotedPost.findOne({"post._id": req.body.post_id}) && await VotedPost.findOne({"voter._id": req.user._id});

    if(votedPost != undefined) {
        votedPost = await VotedPost.findByIdAndUpdate((votedPost._id) ,{
            post,
            voter: req.user,
            status: !votedPost.status
        }, {
            new: true
        })
    } else {
        votedPost = new VotedPost({
            post,
            voter: req.user,
            status: true
        });
    }

    await votedPost.save();

    res.status(200).send(votedPost);
});


module.exports = router;