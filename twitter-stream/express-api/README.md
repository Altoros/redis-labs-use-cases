# Twitter Stream: Express API

## Install

Install Process manager:
```sh
 npm install pm2 -g
```

Install all dependencies:
```sh
    npm install
```

## Config

*Edit config.js* and use your own credentials on twitter and redis, and keyword.

  1. You have to be Register on twitter and then [create an app](https://apps.twitter.com/app/new),
     after that *you will get you consumer and access token keys and secrets*.
     More info on [Access tokens](https://dev.twitter.com/oauth/overview/application-owner-access-tokens)

  1. Keyword (default is #sxsw)

  1. Redis server credentials (Default config is local)

  1. CLOUDINARY_URL env var to support uploading files

## Usage

```sh
pm2 start pm2.json
```

It will run two process, one with the worker, and another with Express running on port 3000 serving data.

Point your browser:
  - List tweets by hashtag [http://localhost:3000/hashtag/sxsw](http://localhost:3000/hashtag/sxsw)
  - Show tweet: http://localhost:3000/tweet/123456


## Deploy to Heroku

 1. Go and get a free account on [Heroku](http://www.heroku.com)
 1. Please create an app with rediscloud service on dashboard.
 1. Set your own credentials on heroku env vars on dashboard, look [config.js](./config.js)
 1. Setup your git remote pointing to heroku app: ```git remote add heroku git@heroku.com:{heroku-app-name}.git```

To deploy On **branch master** and on git clone root dir:

```sh
git subtree push --prefix twitter-stream/express-api/ heroku master
```

Worker dont start until:

```sh
heroku ps:scale worker=1
```

## Help

[Using PM2 command line](https://github.com/Unitech/pm2)
