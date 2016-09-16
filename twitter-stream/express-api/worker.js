/*jslint node: true */
'use strict';
var config = require('./config');
var indexTweet = require('./lib').indexTweet;

// Get dependencies
var Twitter = require('twitter');
var async = require('async');
var _ = require('lodash');
var Q = require('q');

var allChannels = [];

// Set up Twitter client
var client = new Twitter(config.twitter);

// Set up connection to Redis
var redis_conn = require("redis");
var redis = redis_conn.createClient(config.redis.url, {no_ready_check: true});
var subs_redis = redis.duplicate();

// redis default events
//redis.config("SET","notify-keyspace-events", "KEA");

redis.on("error", function (err) {
  console.log("Error: " + err);
});

subs_redis.on("subscribe", function(channel, count) {
  console.log("Subscribed to " + channel + ". Now subscribed to " + count + " channel(s).");
});

subs_redis.on("message", function(channel, message) {
  if(channel === config.redis.subscribe_new_channels) {
    console.log("New channel message from " + channel + ": " + message);
    if(allChannels.indexOf(message) === -1 ) {
      allChannels.push(message);
      twitterSubscribe(message);
    }
  }
});

subs_redis.subscribe(config.redis.subscribe_new_channels);

/**
 * Stream statuses filtered by keyword
 * number of tweets per second depends on topic popularity
 **/

var twitterSubscribe  = function(channel) {
  client.stream('statuses/filter', {track: channel, lang: 'en'},  function(stream) {
    console.log("Initiating Streaming from", channel);
    stream.on('data', function(tweet) {
      indexTweet(redis, channel, tweet);
    });

    stream.on('error', function(error) {
        console.log(error);
    });
  });
};

var getKeys = function() {
  var dfd = Q.defer();
  var usersChannelSet = config.store.channelSet + ':*';
  redis.keys(usersChannelSet, function (err, reply) {
    if(err) {
      dfd.reject(err);
      return;
    }
    return dfd.resolve(reply);
  });

  return dfd.promise;
};

var getUsersChannels = function() {
  var dfd = Q.defer();
  getKeys()
    .then(function(keys) {
      if(keys.length === 0) {
        return dfd.resolve(keys);
      }

      redis.sunion(keys, function (err, reply) {
        if(err) {
          dfd.reject(err);
          return;
        }
        return dfd.resolve(reply);
      });
    })
    .fail(function(err) {
      dfd.reject(err);
    });

  return dfd.promise;
};

getUsersChannels()
  .then(function(channels) {
    allChannels = config.app.channels.concat(channels);
    console.log("Initiating Streaming from", allChannels);
    _.mapKeys(allChannels, twitterSubscribe);
  })
  .fail(function(err) {
    console.log(err);
  });
