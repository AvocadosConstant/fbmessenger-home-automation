var express = require('express');
var router = express.Router();
var passport = require('passport');
var SpotifyWebApi = require('spotify-web-api-node');

var keys = require('../keys');
var credentials = {
  clientId : keys.SPOTIFY_ID,
  clientSecret : keys.SPOTIFY_SECRET,
  redirectUri : keys.SPOTIFY_CB
};
 
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  console.log(req.user);
});

router.get('/me_irl', ensureAuthenticated, function(req, res) {
  var spotify = new SpotifyWebApi(credentials);
  spotify.setAccessToken(req.user.accessToken);
  spotify.setRefreshToken(req.user.refreshToken);
  spotify.getMySavedTracks({
    limit : 40,
    offset: 1
  })
  .then(function(data) {
    res.send(data);
  }, function(err) {
    console.log('Something went wrong!', err);
  });
});

router.get('/auth/spotify',
  passport.authenticate('spotify', {scope: ['user-read-email', 'user-read-private', 'user-library-read'], showDialog: true}),
  function(req, res){
// The request will be redirected to spotify for authentication, so this
// function will not be called.
  });

router.get('/spotify-callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed. Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

module.exports = router;
