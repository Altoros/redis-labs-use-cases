// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.filters', 'ngStorage', 'uuid4', 'ngLodash', 'uiGmapgoogle-maps', 'ngCordova', 'ngMessages', 'ionic.service.core'])

.run(function($ionicPlatform, $rootScope, $localStorage, uuid4) {

  $rootScope.apiBase = 'http://localhost:3000';

  //Default uuid
  $rootScope.storage = $localStorage.$default({ 'uuid' : uuid4.generate() });

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($httpProvider) {
  $httpProvider.interceptors.push(function($rootScope) {
    return {
      'request': function(config) {
        config.headers['x-access-token'] = $rootScope.storage.uuid;
        return config;
      }
    };
  });
})

.config(function(uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyBUFCYWDKbymIa9W4EzjI3-VUGhfvELPPk',
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.add', {
    url: '/add',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/locationadd.html',
        controller: 'LocationAddCtrl',
      }
    }
  })

  .state('app.locations', {
    url: '/locations',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/locationlist.html',
        controller: 'LocationListCtrl',
        resolve: {
          locations: function(location) {
            return location.findMembers().then(function(r) {
              return r.data.result;
            });
          },
          radiuses: function(location) {
            return location.findRadiuses().then(function(r) {
              return r.data.result;
            });
          }
        }
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/locations');
});
