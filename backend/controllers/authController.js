const passport = require('passport');

exports.login = (req, res, next) => {
    // Redirect to OAuth provider for authentication
    passport.authenticate('oauth2', { scope: ['profile', 'email'] })(req, res, next);
};

exports.callback = (req, res, next) => {
    passport.authenticate('oauth2', {
        successRedirect: process.env.FRONTEND_URL || 'http://localhost:5173',
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`
    })(req, res, next);
};

exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.session.destroy(() => {
            res.status(200).send({ message: 'Logged out successfully' });
        });
    });
};

exports.getProfile = (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else {
        res.status(401).send('Not authenticated');
    }
};
