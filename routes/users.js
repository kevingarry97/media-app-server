const express = require('express');
const { User } = require('../models/user');
const { Tokens } = require('../models/token');
const _ = require('lodash');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const config = require('config');
const { sendEmail } = require('../utils/index');
const auth = require('../middleware/auth');
const fromEmail = config.get('fromEmail');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id)
      .select('-password')
    res.status(200).send(user);
})

router.get('/user', async (req, res) => {
    const user = await User.find();
    if (!user) return res.status(404).send('No User Found');
  
    res.status(200).send(user)
})

router.post('/auth', async (req, res) => {
    const { email, password } = req.body;
  
    let user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid Email or Password');
  
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid Email or Password');
  
    const token = user.generateAuthToken();
    res.status(200).send(token);
})

router.post('/user', async (req, res) => {
    const { email, username, password, role } = req.body;
  
    let user = await User.findOne({ email }) || await User.findOne({ username })
    if (user) return res.status(400).send('User already registered');
  
    user = new User({
      username,
      email,
      password,
      role
    })
  
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(user.password, salt);
  
    await user.save();

    // user.generatePasswordReset();
    await sendVerificationEmail(user, req, res);
  
    const token = user.generateAuthToken();
  
    res
      .header('x-auth-token', token)
      .header('access-control-expose-headers', 'x-auth-token')
      .send(_.pick(user, ['_id', 'username', 'email']))
  
})

router.post('/auth/requestReset', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).send('User Email can\'t be found');
  
    let token = await Tokens.findOne({ "user._id": user._id });
    if (!token) {
      token = await new Token({
        user,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }
  
    await token.deleteOne();
  
    let resetToken = crypto.randomBytes(20).toString('hex')
  
    await new Tokens({
      user,
      token: resetToken
    }).save();
  
    let subject = "Request Password Reset";
    let to = user.email;
    let from = fromEmail;
    // let link = "links to";
    let link = "https://" + "localhost:3000/auth/passwordReset/" + resetToken + '/' + user._id;
    let html = `<p>Hi ${user.username}<p><br><p>Your request to reset your password <br></p> 
                    <p>Please, <a href="${link}">link</a> click the link below to reset your password`;
    await sendEmail({ to, from, subject, html });
    res.status(200).send('Sent Successfully')
})

router.post('/auth/resetPassword', async (req, res) => {
    let { userId, token, password } = req.body;
  
    let result = await Tokens.findOne({ token });
    if (!result) res.status(404).send('We were unable to find a valid token. Your token my have expired.');
  
    if (result.user._id != userId) return res.status(404).send('No User with the token found');
  
    const salt = await bcryptjs.genSalt(10);
    password = await bcryptjs.hash(password, salt);
  
    await User.updateOne(
      { _id: userId },
      { $set: { password } },
      { new: true }
    );
  
    let subject = "Password Reset Successfully";
    let to = result.user.email;
    let from = fromEmail;
  
    let html = `<p>Hi ${result.user.username}</p><br><p>Your password has been changed successfully</p>`;
    await sendEmail({ to, from, subject, html });
    res.status(200).send('Reset Successfully')
});

router.get('/auth/verify/:token', async (req, res) => {
    const { token } = req.params;
    if (!token) return res.status(404).send('We were unable to find a user for this token.');
  
    const result = await Tokens.findOne({ token });
    if (!result) res.status(404).send('We were unable to find a valid token. Your token my have expired.');
  
    let user = await User.findOne({ _id: result.user._id });
    if (!user) return res.status(404).send('We were unable to find a user for this token.');
  
    if (user.isVerified) return res.status(400).send('This user has already been verified.');
  
    user.isVerified = true;
    await user.save();
  
    res.status(200).send("The account has been verified. Please log in.");
})

router.put('/me', auth, async (req, res) => {
    const {
        username,
        email,
        password,
        isVerified,
    } = req.body;
    
    const user = await User.findByIdAndUpdate(
        req.user._id, {
        username,
        email,
        password,
        isVerified,
        createdAt: Date.now()
    }, {
        new: true
    });
    
    await user.save();
    
    res.status(200).send(user);
})

async function sendVerificationEmail(users, req, res) {
    try {
      let user = await User.findById(users);
      if (!user) return res.status(404).json({message: 'Not Found User'});
  
      let payload = new Tokens({
        user,
        token: crypto.randomBytes(20).toString('hex')
      })
  
      // Save the verification token
      await payload.save();
  
      let subject = "Account Verification Token";
      let to = users.email;
      let from = fromEmail;
      // let link = "links to";
      let link = "http://" + "localhost:3000/auth/" + payload.token;
      let html = `<p>Hi ${users.username}<p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p> 
                    <br><p>If you did not request this, please ignore this email.</p>`;
      await sendEmail({ to, from, subject, html });
      console.log('Sent ')
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
}
  
module.exports = router;
  