const { check, validationResult } = require('express-validator');

const protectSearch = [
    check('search')
        .isLength({ max: 100 }).withMessage('Requête invalide : La recherche est trop longue.')
        .matches(/^[a-zA-Z0-9\s-]*$/).withMessage('Requête invalide : Caractères non autorisés.')
        .escape(), // Échappe les caractères potentiellement dangereux

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = protectSearch;