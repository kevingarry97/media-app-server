const express = require('express');
const { Post } = require('../models/post');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../multer');
const cloudinary = require('../cloudinary')

router.get('/posts', async (req, res) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;

    const postQuery = Post.find();

    if (pageSize && currentPage)
        postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);

    const posts = await postQuery;
    res.status(200).send(posts)
})

router.post('/post', auth, upload.array("files"), async (req, res) => {
    const { description, status } = req.body
    const uploader = async (path) => await cloudinary.uploads(path, "Files");

    const urls = [];
    const files = req.files;

    for (const file of files) {
        const { path } = file;
    
        const newPath = await uploader(path);
    
        urls.push(newPath);
    }

    const post = new Post({
        description,
        status,
        owner: req.user,
        media: urls.map(item => item['url'])
    });

    await post.save();

    res.status(200).send(post);

});

router.put('/post/:id', auth, async (req, res) => {
    const {description, status, owner, media} = req.body;

    const post = await Post.findByIdAndUpdate(req.params.id, {
        description,
        status,
        owner,
        media,
        createdAt: Date.now()
    }, {
        new: true
    });

    await post.save();

    res.status(200).send(post);
})

router.delete('/post/:id', auth, async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
        message: 'No Content Found'
    })
});

module.exports = router;