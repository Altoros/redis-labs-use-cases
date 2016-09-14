angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicSideMenuDelegate, $rootScope, $state, defaultChannels, userChannels, tweet, $ionicPopup) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  $scope.channels = defaultChannels.concat(userChannels);

  $scope.isChannelActive = function(channel) {
    return (channel == $rootScope.storage.channel);
  };

  $scope.setChannelActive = function(channel) {
    $rootScope.storage.channel = channel;
    $state.reload($rootScope.previousState);
  };

  $ionicModal.fromTemplateUrl('templates/channelmodal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.createChannel = function(channel) {
    tweet.addChannel(channel).then(function(res) {
      $scope.modal.hide();
      $scope.channels.push(channel);
      $scope.setChannelActive(channel);
    });
  };

  $scope.removeChannel = function(channel) {
    if(defaultChannels.indexOf(channel) !== -1) {
      $scope.showAlert();
      return;
    }

    tweet.removeChannel(channel).then(function(res) {
      $scope.modal.hide();
      var index = $scope.channels.indexOf(channel);
      if( index == -1) {
        $log.error('Removed channel' , channel, ' from db but it is not present in frontned ');
        return;
      }
      $scope.channels.splice(index, 1);
      $scope.setChannelActive($scope.channels[0]);
    });
  };

  $scope.showAlert = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Message',
      template: 'You can delete default channels'
    });
    alertPopup.then(function(res) {
    });
  };

})

.controller('TweetListCtrl', function($scope, $rootScope, tweet, $q) {
  $scope.page = 0;
  $scope.next = true;
  $scope.tweets = [];

  var setChannel = function(channel) {
    $rootScope.channel = channel;
    $rootScope.defaultHashtag = channel;
    $scope.searchKey = channel;
    $scope.clearAndSearch();
  };

  var getDefaultCriteria = function() {
    return $rootScope.defaultHashtag;
  };

  var loadData = function() {
    if($scope.searchKey && $scope.next) {
      $scope.page = $scope.next ? $scope.page + 1 : $scope.page;
      tweet.findViewed($scope.searchKey, { page: $scope.page })
        .then(function(r) {
          if (r.data.result.length) {
            $scope.tweets = $scope.tweets.concat(r.data.result);
            $scope.$broadcast('scroll.infiniteScrollComplete');
          } else {
            $scope.next = false;
          }
        });
    }
  };

  var clearCriteria = function(searchKey) {
    $scope.page = 0;
    $scope.next = true;
    $scope.tweets = [];
    $scope.searchKey = (searchKey)  ? searchKey : getDefaultCriteria();
  };

  var clearAndSearch = function() {
    if($scope.searchKey) {
      $scope.clearCriteria($scope.searchKey);
      $scope.loadData();
    }
  };

  $scope.clearAndSearch = clearAndSearch;
  $scope.searchKey = getDefaultCriteria();
  $scope.loadData = loadData;
  $scope.clearCriteria = clearCriteria;
  $scope.setChannel = setChannel;
  $scope.channels = $rootScope.channels;
})

.controller('TweetDetailCtrl', function($scope, $stateParams, tweetDetail, tweet) {
  $scope.tweet = tweetDetail;
})

.controller('TweetFavoriteCtrl', function($scope, $stateParams, tweetFavorites) {
  $scope.tweets = tweetFavorites;
})

.controller('TweetNopeCtrl', function($scope, $stateParams, tweetNopes) {
  $scope.tweets = tweetNopes;
})

.controller('RecommendationCtrl', function($scope, $stateParams, tweetList) {
  $scope.tweets = tweetList;
})

.controller('StreamCtrl', function($scope, $stateParams, TDCardDelegate, tweet, $rootScope, socket, $log, detail) {
  $scope.cards = [];
  $scope.newTweets = [];
  $scope.loadedNewItems = false;
  $scope.states = { nopes: 'app.nopes', favorites: 'app.favorites', recommendations: 'app.recommendations' };
  $scope.previousState = $rootScope.previousState;
  $scope.tweet = detail;

  socket.on('message', function (message) {
    if(message.channel == $rootScope.storage.channel) {
      $log.debug("IO msg:", message);
      $scope.newTweets.push(message);
    }
  });

  var loadNewItems = function() {
    $log.debug('New Cards: ', $scope.newTweets);
    $scope.cards = $scope.cards.concat($scope.newTweets);
    $log.debug('All Cards: ', $scope.cards);
    $scope.newTweets = [];
    $scope.loadedNewItems = true;
  };

  $scope.loadNewItems = loadNewItems;

  var loadData = function() {
    tweet.findToSwipe()
      .then(function(r) {
        if(Object.keys($scope.tweet).length !== 0 && $scope.loadedNewItems === false) {
          r.data.result.push($scope.tweet);
        }
        $scope.cards = r.data.result;
      });
  };

  $scope.cardDestroyed = function(index) {
    $scope.cards.splice(index, 1);
    if(!$scope.cards.length) {
      loadData();
    }
  };

  var swipeCard = function(card) {
    tweet.swipe(card);
    updateSwiped();
  };

  var updateSwiped = function() {
    $scope.swiped = tweet.getSwiped();
  };

  $scope.cardSwipedLeft = function(card) {
    tweet.nope(card.id, card.remove);
    swipeCard(card);
  };

  $scope.cardSwipedRight = function(card) {
    tweet.like(card.id, card.remove);
    swipeCard(card);
  };

  updateSwiped();
  loadData();

})

;
