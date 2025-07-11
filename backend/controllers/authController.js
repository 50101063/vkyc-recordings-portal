const passport = require('passport');

exports.login = passport.authenticate('oidc');

exports.callback = passport.authenticate('oidc', {
    successRedirect: '/', // Redirect to frontend dashboard on success
    failureRedirect: '/login-failure' // Redirect to a failure page on error
});

exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy(() => {
            res.redirect('/'); // Redirect to home or login page after logout
        });
    });
};

exports.currentUser = (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
};
