const express = require('express');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const authController = require('../controllers/authController');
const config = require('../config');

const router = express.Router();

// Configure Passport.js OAuth2 Strategy
passport.use('oauth2', new OAuth2Strategy({
    authorizationURL: config.oauth.authorizationURL,
    tokenURL: config.oauth.tokenURL,
    clientID: config.oauth.clientId,
    clientSecret: config.oauth.clientSecret,
    callbackURL: config.oauth.callbackURL,
    scope: ['profile', 'email'] // Adjust scopes as per your IdP
},
(accessToken, refreshToken, profile, cb) => {
    // In a real application, you would fetch user profile from IdP's user info endpoint
    // or validate/create user in your local database based on the IdP's response.
    // For this example, we'll just return a dummy user.
    const user = { id: '123', name: 'Test User', email: 'test@example.com', accessToken: accessToken };
    return cb(null, user);
}));

router.get('/login', authController.login);
router.get('/callback', authController.callback);
router.get('/logout', authController.logout);
router.get('/profile', authController.getProfile);

module.exports = router;
