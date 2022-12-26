const express = require('express');
const auth = require('../middleware/auth');
const { LikedPost } = require('../models/likedPost');
const { Post } = require('../models/post');
const router = express.Router();

router.get('/liked/post', async (req, res) => {
    const likedPosts = await LikedPost.find();
    if (!likedPosts) return res.status(404).json({message: 'No Liked Posts Found!!'});

    res.status(200).send(likedPosts);
});

router.post('/like/post', auth, async (req, res) => {

    const post = await Post.findOne({"_id": req.body.post_id})
    if (!post) return res.status(404).send({message: 'No Post Found'});

    let likedPost = await LikedPost.findOne({"post._id": req.body.post_id}) && await LikedPost.findOne({"liker._id": req.user._id});

    if(likedPost != undefined) {
        likedPost = await LikedPost.findByIdAndUpdate((likedPost._id) ,{
            post,
            liker: req.user,
            status: !likedPost.status
        }, {
            new: true
        })
    } else {
        likedPost = new LikedPost({
            post,
            liker: req.user,
            status: true
        });
    }

    await likedPost.save();

    res.status(200).send(likedPost);
});


module.exports = router;