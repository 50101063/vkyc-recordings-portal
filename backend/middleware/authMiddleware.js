exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // If not authenticated, redirect to login or send 401
    res.status(401).json({ message: 'Authentication required.' });
};

// Optional: Middleware for role-based access control
exports.hasRole = (roles) => {
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        // Assuming user roles are available in req.user.roles (or similar)
        const userRoles = req.user.roles || [];
        const hasRequiredRole = roles.some(role => userRoles.includes(role));

        if (hasRequiredRole) {
            return next();
        } else {
            res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
    };
};
