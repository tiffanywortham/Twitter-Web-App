"use strict";

const express = require('express'),
    hoffman = require('hoffman'),
    path = require('path'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    bodyParser = require('body-parser'),
    authConfig = require('./modules/authConfig'),
    authHandling = require('./modules/authHandling'),
    https = require('https');
    
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'dust');
app.engine('dust', hoffman.__express());

const listeningPort = parseInt(process.argv[2]) || 3001;

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(require('express-session')({
    secret: 'issa secret yo',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/resources", express.static("resources"));

let twitterOptions = {
    consumerKey: authConfig.TWITTER_CONSUMER_KEY,
    consumerSecret: authConfig.TWITTER_CONSUMER_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
};

let twitterAuthStrat = 'twitter-auth';
passport.use(twitterAuthStrat, new TwitterStrategy(twitterOptions,
    (token, tokenSecret, profile, done) => {
    
        done(null, {
            profile: profile,
            token: token,
            tokenSecret: tokenSecret
        });
    }
));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


app.get('/', (request, response) => {
    response.render('index', {});
});

app.get('/auth/twitter', passport.authenticate(twitterAuthStrat));

app.get('/auth/twitter/callback', passport.authenticate(twitterAuthStrat, {
    successRedirect: '/',
    failureRedirect: '/'
}));

app.get('/protected',
    (request, response) => {
        if (request.user) { //check that they're logged in...
            response.render('protected', request.user.profile._json);
        } else { //If not, we'll send them back to the login page
            response.redirect('/auth/twitter');
        }
    }
);

app.get('/auth/logout', (request, response) => {
    request.logout();
    response.redirect('/');
});

let searchOptions = {
    hostname: 'api.twitter.com',
    port: 443,
    path: '/1.1/search/tweets.json',
    method: 'GET',
};

app.get('/hashtag/:whatevs', (request, response) => {
    let user = request.user;
    
    if (user) { 
        let hashTag = request.params.whatevs;

        let searchSpecificOptions = Object.assign(searchOptions, {});
        
        let firstPath = searchSpecificOptions.path;

        searchSpecificOptions.path += `?q=${hashTag}`;

        searchSpecificOptions['headers'] = authHandling.getOauthHeader(authConfig.TWITTER_CONSUMER_KEY,
            authConfig.TWITTER_CONSUMER_SECRET,
            user.token,
            user.tokenSecret,
            hashTag);

        let requestToTwitter = https.request(searchSpecificOptions, (responseFromTwitter) => {
            let allTweets;
            responseFromTwitter.on('data', (tweets) => {
                if (allTweets) {
                    allTweets += tweets;
                } else {
                    allTweets = tweets;
                }
            });
            responseFromTwitter.on('error', (err) => {
                console.error(err);
            });
            responseFromTwitter.on('end', () => {
                let parsedTweets = JSON.parse(allTweets.toString());
                response.render('hashtag', parsedTweets);
                console.log(parsedTweets);
                console.log('nope');
            });
        });
        requestToTwitter.end();
        
        searchSpecificOptions.path = firstPath;

    } else {
        response.redirect('/auth/twitter');
    }
});



app.get('/chart/:whatevs', (request, response) => {
    let user = request.user;

    if (user) {
        let chartHashTag = request.params.whatevs;

        let searchSpecificOptions = Object.assign(searchOptions, {});
        
        let firstPath = searchSpecificOptions.path;

        searchSpecificOptions.path += `?q=${chartHashTag}`;

        searchSpecificOptions['headers'] = authHandling.getOauthHeader(authConfig.TWITTER_CONSUMER_KEY,
            authConfig.TWITTER_CONSUMER_SECRET,
            user.token,
            user.tokenSecret,
            chartHashTag);

        let requestToTwitter = https.request(searchSpecificOptions, (responseFromTwitter) => {
            let allTweets;
            responseFromTwitter.on('data', (tweets) => {
                if (allTweets) {
                    allTweets += tweets;
                } else {
                    allTweets = tweets;
                }
            });
            responseFromTwitter.on('error', (err) => {
                console.error(err);
            });
            responseFromTwitter.on('end', () => {
                let parsedTweets = JSON.parse(allTweets.toString());
                response.render('chart', parsedTweets);
                console.log(parsedTweets);
            });
        });
        requestToTwitter.end();
        
        searchSpecificOptions.path = firstPath;

    } else {
        response.redirect('/auth/twitter');
    }
    
});

app.listen(listeningPort, () => {
    console.log(`My app is listening on port ${listeningPort}!`);
});
