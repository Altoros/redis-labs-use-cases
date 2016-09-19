angular.module('starter.services', [])

.factory('socket', function (socketFactory, $rootScope) {
  return socketFactory({
    ioSocket: io.connect($rootScope.apiBase)
  });
})

.factory('tweet', function ($http, $rootScope, Upload) {
  var _tweet = {};
  var _swiped = [];

  _tweet.findByHashtag = function(hashtag, queryString) {
    return $http.get($rootScope.apiBase + '/hashtag/' + hashtag + '/' + $rootScope.storage.channel, { params: queryString });
  };

  _tweet.findToSwipe = function(queryString) {
    return $http.get($rootScope.apiBase + '/swipes/' + $rootScope.storage.channel, { params: queryString });
  };

  _tweet.findViewed = function(search, queryString) {
    return $http.get($rootScope.apiBase + '/viewed/' + $rootScope.storage.channel, { params: queryString });
  };

  _tweet.findById = function(id) {
    return $http.get($rootScope.apiBase + '/tweet/' + id + '/' + $rootScope.storage.channel );
  };

  _tweet.findRecommendations = function() {
    return $http.get($rootScope.apiBase + '/recommendations/' + $rootScope.storage.channel);
  };

  _tweet.like = function(id, remove) {
    var removeParam = (remove != 1) ? '': '/1';
    return $http.get($rootScope.apiBase + '/like/' + id + '/' + $rootScope.storage.channel + removeParam );
  };

  _tweet.nope = function(id, remove) {
    var removeParam = (remove != 1) ? '': '/1';
    return $http.get($rootScope.apiBase + '/nope/' + id + '/' + $rootScope.storage.channel + removeParam);
  };

  _tweet.getFavorites = function() {
    return $http.get($rootScope.apiBase + '/likes/' + $rootScope.storage.channel);
  };

  _tweet.getNopes = function() {
    return $http.get($rootScope.apiBase + '/nopes/' + $rootScope.storage.channel);
  };

  _tweet.findUserChannels = function() {
    return $http.get($rootScope.apiBase + '/channels/user');
  };

  _tweet.addChannel = function(channel) {
    return $http.get($rootScope.apiBase + '/channels/add/' + channel);
  };

  _tweet.removeChannel = function(channel) {
    return $http.get($rootScope.apiBase + '/channels/remove/' + channel);
  };

  _tweet.getChannels = function() {
    return $http.get($rootScope.apiBase + '/channels/');
  };

  _tweet.addTweet = function(content, picFile) {
    var data = { data: { content: content, file: picFile }, url: $rootScope.apiBase + '/tweet/add/' + $rootScope.storage.channel };
    return Upload.upload(data);
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

  _tweet.resetSwiped = function() {
    _swiped = [];
  };

  return _tweet;
});
