function isAuthenticated(req, res, next) {
    if (req.session && req.session.uid) {
        // Utilisateur authentifié, vous pouvez vérifier ses rôles ici
        if (req.session.isAdmin || req.session.isModerator || req.session.uid ) {
            // L'utilisateur est administrateur, modérateur ou propriétaire du profil, continuez la demande
            return next();
        } else {
            // Redirigez l'utilisateur vers une page d'erreur ou une page d'accès refusé
            res.redirect('/access-denied');
        }
    } else {
        // L'utilisateur n'est pas authentifié, redirigez-le vers la page de connexion
        res.redirect('/user/login');
    }
}

module.exports = isAuthenticated;