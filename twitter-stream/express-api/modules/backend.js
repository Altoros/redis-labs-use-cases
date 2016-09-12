var config = require('./../config');
var stringHash = require('string-hash');
var async = require('async');
var Q = require('q');

// Set up connection to Redis
var redis_conn = require("redis");
var redis = redis_conn.createClient(config.redis.url, {detect_buffers: true, no_ready_check: true});

redis.on("error", function (err) {
  console.log("Error: " + err);
});

// get user id if exists otherwise create user
exports.findUser = function(token) {
  var deferred = Q.defer();

  redis.hget(config.store.auths, token, function(err, reply) {
    if(err) {
     deferred.reject(err);
     return;
    }
    if(reply === null) {
      redis.incr(config.store.user_next_id, function(err, reply) {
        if(err) {
          deferred.reject(err);
          return;
        }
        redis.hset(config.store.auths, token, reply, function(err, reply) {
          if(err) {
            deferred.reject(err);
            return;
          }
          deferred.resolve(reply);
        });

      });
    } else {
      deferred.resolve(reply);
    }
  });

  return deferred.promise;
};

exports.findRecommendations = function(userId, channel) {
  var deferred = Q.defer();
  var tweetHashChannel = config.store.tweetHash + ':' + channel;
  var voteZsetChannel = config.store.voteZset + ':' + channel;
  var rangeArgs = [ voteZsetChannel, 0, 9 ];

  redis.zrevrange(rangeArgs, function (err, response) {
    var result = [];
    if(err) {
      deferred.reject(err);
    } else {
      if (response.length === 0) {
        // No result
        deferred.resolve([]);
      } else {
        async.forEach(response, function (tweetId, callback) {
          redis.hget(tweetHashChannel, tweetId, function (err, reply) {
            // console.log(">>",reply);
            result.push({ id: tweetId, content: reply });
            callback();
          });
        }, function (err) {
          if(err) {
            deferred.reject(err);
            return;
          }
          deferred.resolve(result);
        });
      }
    }
  });

  return deferred.promise;
};

exports.findLikes = function(userId, channel) {
  var deferred = Q.defer();
  var userLikeSet = config.store.likeSet + ':' + userId + ':' + channel;
  var tweetHashChannel = config.store.tweetHash + ':' + channel;

  redis.smembers(userLikeSet, function (err, response) {
    var result = [];
    if(err) {
      deferred.reject(err);
    } else {
      if (response.length === 0) {
        // No result
        deferred.resolve([]);
      } else {
        async.forEach(response, function (tweetId, callback) {
          redis.hget(tweetHashChannel, tweetId, function (err, reply) {
            // console.log(">>",reply);
            result.push({ id: tweetId, content: reply });
            callback();
          });
        }, function (err) {
          if(err) {
            deferred.reject(err);
            return;
          }
          deferred.resolve(result);
        });
      }
    }
  });

  return deferred.promise;
};

exports.findNopes = function(userId, channel) {
  var deferred = Q.defer();
  var userNopeSet = config.store.nopeSet + ':' + userId + ':' + channel;
  var tweetHashChannel = config.store.tweetHash + ':' + channel;

  redis.smembers(userNopeSet, function (err, response) {
    var result = [];
    if(err) {
      deferred.reject(err);
    } else {
      if (response.length === 0) {
        // No result
        deferred.resolve([]);
      } else {
        async.forEach(response, function (tweetId, callback) {
          redis.hget(tweetHashChannel, tweetId, function (err, reply) {
            // console.log(">>",reply);
            result.push({ id: tweetId, content: reply });
            callback();
          });
        }, function (err) {
          if(err) {
            deferred.reject(err);
            return;
          }
          deferred.resolve(result);
        });
      }
    }
  });

  return deferred.promise;
};

exports.voteTweet = function(tweetId, userId, channel) {
  var voteZsetChannel = config.store.voteZset + ':' + channel;
  var dfd = Q.defer();
  redis.zincrby(voteZsetChannel, 1, tweetId, function (err, reply) {
    if(err) {
      dfd.reject(err);
      return;
    }
    return dfd.resolve(reply);
  });

  return dfd.promise;
};

exports.likeTweet = function(tweetId, userId, channel) {
  var dfd = Q.defer();
  var userLikeSet = config.store.likeSet + ':' + userId + ':' + channel;

  redis.sadd(userLikeSet, tweetId, function (err, reply) {
    if(err) {
      dfd.reject(err);
      return;
    }
    return dfd.resolve(reply);
  });

  return dfd.promise;
};

exports.nopeTweet = function(tweetId, userId, channel) {
  var dfd = Q.defer();
  var userNopeSet = config.store.nopeSet + ':' + userId + ':' + channel;

  redis.sadd(userNopeSet, tweetId, function (err, reply) {
    if(err) {
      dfd.reject(err);
      return;
    }
    return dfd.resolve(reply);
  });

  return dfd.promise;
};

exports.findById = function(tweetId, userId, channel) {
  var res = null;
  var tweetHashChannel = config.store.tweetHash + ':' + channel;
  var dfd = Q.defer();
  redis.hget(tweetHashChannel, tweetId, function (err, reply) {
    if(err) {
      dfd.reject(err);
      return;
    }
    res = (reply) ? { id: tweetId, content: reply } : reply;
    return dfd.resolve(res);
  });

  return dfd.promise;
};


exports.findToSwipe = function(userId, channel) {
  var tweetHashChannel = config.store.tweetHash + ':' + channel;
  var tweetSetChannel = config.store.tweetSet + ':' + channel;
  var likeUserSet = config.store.likeSet + ':' + userId + ':' + channel;
  var nopeUserSet = config.store.nopeSet + ':' + userId + ':' + channel;
  var swipedUserSet = config.store.swipedSet + ':' + userId + ':' + channel;
  var unionArgs =  [ swipedUserSet, likeUserSet, nopeUserSet ];
  var default_offset = 0;
  var default_count = 10;
  var deferred = Q.defer();

  redis.sunionstore(unionArgs, function(err, result) {
    if(err) {
      deferred.reject(err);
      return;
    }
    var diffArgs = [ tweetSetChannel, swipedUserSet ];
    redis.sdiff(diffArgs, function(err, response) {

      var result = [];
      if(err) {
        deferred.reject(err);
      } else {
        if (response.length === 0) {
          deferred.resolve([]);
        } else {
          response = response.slice(default_offset, default_count);
          async.forEach(response, function (tweetId, callback) {
            redis.hget(tweetHashChannel, tweetId, function (err, reply) {
              result.push({ id: tweetId, content: reply});
              callback();
            });
          }, function (err) {
            if(err) {
              deferred.reject(err);
              return;
            }
            deferred.resolve(result);
          });
        }
      }
    });
  });

  return deferred.promise;
};


exports.findViewed = function(userId, offset, count, channel) {
  var default_offset = 0;
  var default_count = 10;
  offset = (offset === undefined) ? default_offset : offset;
  count = (count === undefined) ? default_count : count;

  var tweetHashChannel = config.store.tweetHash + ':' + channel;
  var tweetSetChannel = config.store.tweetSet + ':' + channel;
  var nopeUserSet = config.store.nopeSet + ':' + userId + ':' + channel;
  var diffArgs = [ tweetSetChannel, nopeUserSet ];

  var deferred = Q.defer();

  redis.sdiff(diffArgs, function(err, response) {
    var result = [];
    if(err) {
      deferred.reject(err);
    } else {
      if (response.length === 0) {
        deferred.resolve([]);
      } else {
        response = response.slice(offset, (offset+count));
        async.forEach(response, function (tweetId, callback) {
          redis.hget(tweetHashChannel, tweetId, function (err, reply) {
            result.push({ id: tweetId, content: reply});
            callback();
          });
        }, function (err) {
          if(err) {
            deferred.reject(err);
            return;
          }
          deferred.resolve(result);
        });
      }
    }
  });

  return deferred.promise;
};

exports.findByHashtag = function(hashtag, offset, count, userId, channel) {
  var deferred = Q.defer();
  var score = stringHash(hashtag);
  var default_offset = 0;
  var default_count = 10;

  offset = (offset === undefined) ? default_offset : offset;
  count = (count === undefined) ? default_count : count;

  var tweetHashChannel = config.store.tweetHash + ':' + channel;
  var hashtagZsetChannel = config.store.hashtagZset + ':' + channel;
  var args1 = [ hashtagZsetChannel, score, score, 'LIMIT', offset, count ];

  redis.zrangebyscore(args1, function (err, response) {
    var result = [];
    if(err) {
      deferred.reject(err);
    } else {
      if (response.length === 0) {
        // No result
        deferred.resolve([]);
      } else {
        //console.log('Result', response);
        async.forEach(response, function (tweetId, callback) {
          redis.hget(tweetHashChannel, tweetId, function (err, reply) {
            // console.log(">>",reply);
            result.push({ id: tweetId, content: reply});
            callback();
          });
        }, function (err) {
          if(err) {
            deferred.reject(err);
            return;
          }
          deferred.resolve(result);
        });
      }
    }
  });

  return deferred.promise;
};

exports.getChannels = function() {
  return config.app.channels;
};
