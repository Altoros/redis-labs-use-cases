angular.module('starter.services', [])

.factory('socket', function (socketFactory, $rootScope) {
  return socketFactory({
    ioSocket: io.connect($rootScope.apiBase)
  });
})

.factory('tweet', function ($http, $rootScope) {
  var _tweet = {};
  var _swiped = [];

  _tweet.findByHashtag = function(hashtag, queryString) {
    return $http.get($rootScope.apiBase + '/hashtag/' + hashtag + '/' + $rootScope.channel, { params: queryString });
  };

  _tweet.findToSwipe = function(queryString) {
    return $http.get($rootScope.apiBase + '/swipes/' + $rootScope.channel, { params: queryString });
  };

  _tweet.findViewed = function(search, queryString) {
    return $http.get($rootScope.apiBase + '/viewed/' + $rootScope.channel, { params: queryString });
  };

  _tweet.findById = function(id) {
    return $http.get($rootScope.apiBase + '/tweet/' + id + '/' + $rootScope.channel );
  };

  _tweet.findRecommendations = function() {
    return $http.get($rootScope.apiBase + '/recommendations/' + $rootScope.channel);
  };

  _tweet.like = function(id) {
    return $http.get($rootScope.apiBase + '/like/' + id + '/' + $rootScope.channel );
  };

  _tweet.nope = function(id) {
    return $http.get($rootScope.apiBase + '/nope/' + id + '/' + $rootScope.channel );
  };

  _tweet.getFavorites = function() {
    return $http.get($rootScope.apiBase + '/likes/' + $rootScope.channel);
  };

  _tweet.getNopes = function() {
    return $http.get($rootScope.apiBase + '/nopes/' + $rootScope.channel);
  };

  _tweet.getChannels = function() {
    return $http.get($rootScope.apiBase + '/channels/');
  };

  _tweet.swipe = function(tweet) {
    var exists = false;
    for (var i = 0; i < _swiped.length; i++) {
      if (_swiped[i].id === tweet.id) {
        exists = true;
        break;
      }
    }
    if (!exists) _swiped.push(tweet);
  };

  _tweet.getSwiped = function() {
    return _swiped;
  };

  return _tweet;
});
