var express = require('express');
var app = express();
var mongoose = require('mongoose');
var Tweet = require('./app/tweetrepo.js');
var fs = require('fs');

mongoose.connect("mongodb://localhost:27017/tweets_development")

var processTweets = function(filepath) {
  var array = new Array();
  var stream = fs.createReadStream(filepath, {flags: 'r', encoding: 'utf-8'});
  var buf = '';

  stream.on('data', function(d) {
    buf += d.toString(); // when data is read, stash it in a string buffer
    pump(); // then process the buffer
  }).on('end', function(){
   console.log("FINISHED"); 
  })

  function pump() {
    var pos;
    while ((pos = buf.indexOf('\n')) >= 0) { // keep going while there's a newline somewhere in the buffer
      process(buf.slice(0,pos)); // hand off the line
      buf = buf.slice(pos+1); // and slice the processed data off the buffer
    }
  }

  function process(line) { // here's where we do something with a line
    if (line.length > 0) { // ignore empty lines
    // parse the JSON
    isJson(line)
    }
  }

  function isJson(str) {
    try {
      var obj = JSON.parse(str);
    } catch (e) {
      return false;
    }
    if (obj.coordinates != null && latIsFine(obj.coordinates.coordinates[1]) && longIsFine(obj.coordinates.coordinates[0])) {
      var hourCreated = new Date(obj.created_at).getHours();
      var tweet = new Tweet;
        tweet._id = obj.id_str;
        tweet.createdAt = obj.created_at;
        tweet.timeSlot = findTimeSlot(hourCreated);
        tweet.content = obj.text;
        tweet.longitude = obj.coordinates.coordinates[0];
        tweet.latitude = obj.coordinates.coordinates[1];
        tweet.userId = obj.user.id_str;
        tweet.username = obj.user.screen_name;

      tweet.save(function(err){
        if (err)
          return false;
        return true;
      });
    } else {
      return true;
    }
  };

  function latIsFine (latitude){
    return latitude >= 51.2415153 && latitude <= 51.7419679
  }

  function longIsFine(longitude){
    return longitude >= -0.5654233 && longitude <= 0.3109232
  }

  function findTimeSlot(hourCreated) {
    return Math.floor(hourCreated / 4) + 1
  }
}

app.get('/', function(req, res) {

  processTweets("./tweets.txt");

});

app.listen(3000)

console.log("Server started on 3000")

