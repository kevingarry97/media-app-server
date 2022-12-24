const mongoose = require('mongoose');
const config = require('config');

const db = config.get('db');
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log(`Connected to ${db} successfully...`));

exports.mongoose = mongoose;
