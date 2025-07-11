require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const OIDCStrategy = require('passport-openidconnect').Strategy;
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const db = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Passport.js setup for OIDC
passport.use('oidc', new OIDCStrategy({
    issuer: process.env.OIDC_ISSUER,
    authorizationURL: `${process.env.OIDC_ISSUER}/authorize`,
    tokenURL: `${process.env.OIDC_ISSUER}/token`,
    userInfoURL: `${process.env.OIDC_ISSUER}/userinfo`,
    clientID: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    callbackURL: process.env.OIDC_REDIRECT_URI,
    scope: 'openid profile email'
}, (issuer, profile, cb) => {
    // In a real application, you would lookup or create the user in your database
    // based on the profile information (e.g., profile.id or profile.email)
    console.log(`User ${profile.displayName} (${profile.id}) authenticated.`);
    return cb(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

// Basic route for health check
app.get('/', (req, res) => {
    res.send('V-KYC Recordings Backend API is running!');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        message: err.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    db.connect(); // Connect to the database on startup
});
