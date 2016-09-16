var config = require('./config');
var twitterText = require('twitter-text');
var async = require('async');
var stringHash = require('string-hash');

exports.indexTweet = function(redis, channel, tweet) {

  var tweetHashChannel = config.store.tweetHash + ':' + channel;
  var tweetSetChannel = config.store.tweetSet + ':' + channel;
  var voteZsetChannel = config.store.voteZset + ':' + channel;
  var hashtagZsetChannel = config.store.hashtagZset + ':' + channel;

  console.log(JSON.stringify(channel, tweet.text, null, 4));

  //Publish tweet to IO
  var obj = { channel: channel, id: tweet.id_str, content: tweet.text };
  redis.publish(config.io.channel, JSON.stringify(obj));

  //Hash with tweet text
  redis.hset(tweetHashChannel, tweet.id_str, tweet.text);

  //Set with tweets id
  redis.sadd(tweetSetChannel, tweet.id_str);

  //Preparing zset vote index
  var tVote = [ voteZsetChannel, 0, tweet.id_str ];
  redis.zadd(tVote);

  var args = [ hashtagZsetChannel ];
  async.forEach(twitterText.extractHashtags(tweet.text),
    function (hashtag, callback) {
      console.log("Found hashtag ", hashtag);
      args.push(stringHash(hashtag));
      args.push(tweet.id_str);
      callback();
    },
    function (err) {
      console.log(JSON.stringify(args, null, 4));
      redis.zadd(args, function (err, response) {
        if (err) {
          console.error("ZADD error ", err);
          return;
        }
      });
    }
  );
};

exports.getRandom = function (length) {
  return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1));
};
