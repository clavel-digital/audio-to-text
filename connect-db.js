const mongoose = require('mongoose');

const DBURL = process.env.MONGODB_URI;

mongoose.Promise = Promise;
mongoose.connect(DBURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to Mongo on ${DBURL}`)
  }).catch(err => {
    console.error('Error connecting to mongo', err)
  });
