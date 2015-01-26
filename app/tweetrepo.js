var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TweetSchema = new Schema({

  _id: String,
  createdAt: Date,
  hourCreated: Number,
  content: String,
  longitude: Number,
  latitude: Number,
  userId: String,
  username: String

});

module.exports = mongoose.model('Tweet', TweetSchema);
