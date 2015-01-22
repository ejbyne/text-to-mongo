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
      // setTimeout(loop(pos), 1000);
    }
  }

  // function loop(pos) {
  //   process(buf.slice(0,pos)); // hand off the line
  //   buf = buf.slice(pos+1); // and slice the processed data off the buffer
  // }

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
    if (obj.geo != null && latIsFine(obj.geo.coordinates[0]) && longIsFine(obj.geo.coordinates[1])){
        var tweet = new Tweet;
          tweet.created_at = obj.created_at;
          tweet.user_id = obj.id;
          tweet.tweet_id = obj.id_str;
          tweet.text = obj.text; 
          tweet.longitude = obj.geo.coordinates[1];
          tweet.latitude = obj.geo.coordinates[0];
        tweet.save(function(err){
          if(err)
            return false
          return true;
        });
    } else{
      return true;
    }
  }

  function latIsFine (latitude){
    return latitude >= 51.2415153 && latitude <= 51.7419679
  }

  function longIsFine(longitude){
    return longitude >= -0.5654233 && longitude <= 0.3109232
  }
}

app.get('/', function(req, res) {

  processTweets("./tweetslarge.txt");

});

app.listen(3000)

console.log("Server started on 3000")
