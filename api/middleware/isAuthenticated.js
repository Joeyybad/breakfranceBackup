function isAuthenticated(req, res, next) {
    if (req.session && req.session.uid) {
        return next();
    } else {
        res.redirect('/user/login');
    }
}

module.exports = isAuthenticated;