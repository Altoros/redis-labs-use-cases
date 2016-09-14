var backend = require("./../modules/backend.js");

var rootFunc = function(req, res) {
  res.send("Twitter Stream: Express API");
};

var findRecommendations = function(req, res, next) {
  backend.findRecommendations(req.user, req.params.channel)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var findLikes = function(req, res, next) {
  backend.findLikes(req.user, req.params.channel)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var findNopes = function(req, res, next) {
  backend.findNopes(req.user, req.params.channel)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var findToSwipe = function(req, res, next) {
  backend.findToSwipe(req.user, req.params.channel)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var findViewed = function(req, res, next) {
  var offset = 0;
  var qty_per_page = 10;

  if(req.query.page) {
    offset = (parseInt(req.query.page)-1) * qty_per_page;
  }

  if(offset <= 0) {
    offset = 0;
  }

  backend.findViewed(req.user, offset, qty_per_page, req.params.channel)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var findByHashtag = function(req, res, next) {
  var offset = 0;
  var qty_per_page = 10;

  if(req.query.page) {
    offset = (parseInt(req.query.page)-1) * qty_per_page;
  }

  if(offset <= 0) {
    offset = 0;
  }

  console.log("Searching", req.params.hashtag, offset, qty_per_page, req.params.channel);
  backend.findByHashtag(req.params.hashtag, offset, qty_per_page, req.user, req.params.channel)
    .then(function(result){
      res.json({"status" : "success", "result" : result });
    })
    .fail(function(err){
      console.error("Error", err);
      res.json({"status" : "error", "message" : err});
    });
};

var findById = function(req, res, next) {
  backend.findById(req.params.tweet, req.user, req.params.channel)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};


var nopeTweet = function(req, res, next) {
  var remove = (typeof req.param('remove') !== 'undefined') ? true : false;
  backend.nopeTweet(req.params.tweet, req.user, req.params.channel, remove)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var likeTweet = function(req, res, next) {
  var remove = (typeof req.param('remove') !== 'undefined') ? true : false;
  backend.voteTweet(req.params.tweet, req.user, req.params.channel, false)
    .then(function(result) {
      backend.likeTweet(req.params.tweet, req.user, req.params.channel, remove)
      .then( function(result) { res.json({"status" : "success", "result" : result }); })
      .fail( function(err) { res.json({"status" : "error", "message" : err}); });
    })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var addChannel = function(req, res, next) {
  backend.addChannel(req.user, req.params.channel)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var removeChannel = function(req, res, next) {
  backend.removeChannel(req.user, req.params.channel)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var findUserChannels = function(req, res, next) {
  backend.findUserChannels(req.user)
    .then( function(result) { res.json({"status" : "success", "result" : result }); })
    .fail( function(err) { res.json({"status" : "error", "message" : err}); });
};

var customLogin = function(req, res, next) {
  var token = req.headers['x-access-token'];
  if(!token) {
    return res.status(403).send({ success: false, message: 'No token provided.' });
  }

  backend.findUser(token)
    .then(function(result) {
      req.user = result;
      next();
    })
    .fail(function(err) {
      return res.json({ success: false, message: 'Failed to authenticate token.' });
    });
};

var getChannels = function(req, res, next) {
  var result = backend.getChannels();
  res.json({"status" : "success", "result" : result });
};

var appRouter = function(app) {
  app.use(customLogin);
  app.get('/', rootFunc);
  app.get('/hashtag/hashtag/:channel', findByHashtag);
  app.get('/viewed/:channel', findViewed);
  app.get('/tweet/:tweet/:channel', findById);
  app.get('/like/:tweet/:channel/:remove', likeTweet);
  app.get('/like/:tweet/:channel', likeTweet);
  app.get('/likes/:channel', findLikes);
  app.get('/nopes/:channel', findNopes);
  app.get('/swipes/:channel', findToSwipe);
  app.get('/nope/:tweet/:channel/:remove', nopeTweet);
  app.get('/nope/:tweet/:channel', nopeTweet);
  app.get('/recommendations/:channel', findRecommendations);
  app.get('/channels/add/:channel', addChannel);
  app.get('/channels/remove/:channel', removeChannel);
  app.get('/channels/user', findUserChannels);
  app.get('/channels/', getChannels);
};

module.exports = appRouter;
