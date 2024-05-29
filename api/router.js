const express = require('express');
const { body, param, validationResult } = require('express-validator');
const upload = require('../multer-config');

const homeController = require('./controllers/homeController');
const eventController = require('./controllers/eventController');
const commentController = require('./controllers/commentController');
const userController = require('./controllers/userController');
const groupController = require('./controllers/groupController');
const categorieController = require('./controllers/categorieController');

const protectSearch = require('./middleware/protectSearch')
const isAuthenticated = require('./middleware/isAuthenticated');




const router = express.Router();

//<-----------  Home Routes   ----------->
router.route('/')
    .get(homeController.get);
router.route('/faq')
    .get(homeController.faq)

router.route('/search')
    .post(protectSearch, homeController.search);

//<-----------  Event Routes   ----------->
router.route('/event/create')
    .get(eventController.get)
    .post(
        upload.single('eventImage'), // Middleware Multer pour gérer le téléchargement de l'image
        body('eventName')
            .exists().withMessage('Données incorrectes')
            .trim()
            .isLength({ min: 2, max: 20 }).withMessage('Données incorrectes')
            .notEmpty().withMessage('Données incorrectes')
            .escape(),
        body('eventDescription')
            .exists().withMessage('Données incorrectes')
            .trim()
            .isLength({ min: 10, max: 200 }).withMessage('Données incorrectes')
            .notEmpty().withMessage('Données incorrectes')
            .escape(),
        body('eventDate')
            .isDate().withMessage('Données incorrectes')
            .notEmpty().withMessage('Données incorrectes'),
        body('eventTime')
            .matches(/^([01]\d|2[0-3]):?([0-5]\d)$/).withMessage('Données incorrectes'),
        body('availablePlace')
            .isInt({ min: 1 }).withMessage('Données incorrectes'),
        body('city')
            .notEmpty().withMessage('Données incorrectes')
            .escape(),
        eventController.post
    );
router.route('/event/search')
    .post(protectSearch, eventController.search)
router.route('/event/read/:id')
    .get([
        param('id').exists().withMessage("Données incorrectes")
    ], eventController.read);

router.route('/event/list')
    .get(eventController.list);

router.route('/event/update/:id')
    .get(eventController.getUpdate)
    .post(
        upload.single('eventImage'), // gestion img Multer
        body('eventName')
            .exists().withMessage('Données incorrectes')
            .trim()
            .isLength({ min: 2, max: 20 }).withMessage('Données incorrectes')
            .notEmpty().withMessage('Données incorrectes')
            .escape(),
        body('eventDescription')
            .exists().withMessage('Données incorrectes')
            .trim()
            .isLength({ min: 10, max: 200 }).withMessage('Données incorrectes')
            .notEmpty().withMessage('Données incorrectes')
            .escape(),
        body('eventDate')
            .isDate().withMessage('Données incorrectes')
            .notEmpty().withMessage('Données incorrectes'),
        body('eventTime')
            .matches(/^([01]\d|2[0-3]):?([0-5]\d)$/).withMessage('Données incorrectes'),
        body('availablePlace')
            .isInt({ min: 1 }).withMessage('Données incorrectes'),
        body('city')
            .notEmpty().withMessage('Données incorrectes')
            .escape(),
        eventController.postUpdate
    );

router.route('/event/delete/:id')
    .post(eventController.eventDelete);

//<-----------  Comment Routes   ----------->
router.get('/event/read/:eventId', commentController.getCommentsByEvent);

router.post('/event/read/:eventId/comment', [
    body('name')
        .trim()
        .notEmpty().withMessage('Données incorrectes')
        .isLength({ max: 100 }).withMessage('Données incorrectes')
        .escape(),
    body('comment')
        .trim()
        .notEmpty().withMessage('Données incorrectes')
        .isLength({ max: 1000 }).withMessage('Données incorrectes')
        .escape()
], commentController.post);

router.post('/event/read/:eventId/comment/update/:id', [
    body('name')
        .trim()
        .notEmpty().withMessage('Données incorrectes')
        .isLength({ max: 100 }).withMessage('Données incorrectes')
        .escape(),
    body('comment')
        .trim()
        .notEmpty().withMessage('Données incorrectes')
        .isLength({ max: 1000 }).withMessage('Données incorrectes')
        .escape()
], commentController.postcommentUpdate);

router.post('/event/read/:eventId/comment/delete/:commentId', commentController.deleteComment);

//<----------- Group Routes   ----------->
router.route('/group/list')
    .get(groupController.list);

router.route('/group/search')
    .post(protectSearch, groupController.search)

router.route('/group/read/:id')
    .get(groupController.read);

router.route('/group/create')
    .get(groupController.get)
    .post(
        upload.single('groupImg'), // Middleware Multer pour gérer le téléchargement de l'image
        body('groupName')
            .exists().withMessage('Données incorrectes')
            .trim()
            .isLength({ min: 2, max: 50 }).withMessage('Données incorrectes')
            .notEmpty().withMessage('Données incorrectes')
            .escape(),
        body('groupDescription')
            .exists().withMessage('Données incorrectes')
            .trim()
            .isLength({ min: 10, max: 200 }).withMessage('Données incorrectes')
            .notEmpty().withMessage('Données incorrectes')
            .escape(),
        body('groupCity')
            .exists().withMessage('Données incorrectes')
            .trim()
            .notEmpty().withMessage('Données incorrectes')
            .escape(),
        groupController.create
    );
router.route('/group/update/:id')
    .get(groupController.read)
    .post(groupController.groupUpdate)


//<-----------  User Routes   ----------->
router.route('/user/register')
    .get(userController.get)
    .post(
        [ 
        body('email')
            .notEmpty().withMessage('L\'adresse e-mail est requise.')
            .isEmail().withMessage('L\'adresse e-mail n\'est pas valide.')
            .trim()
            .escape(),

        body('password')
            .isLength({ min: 6 }).withMessage('Le mot de passe doit comporter au moins 8 caractères.')
            .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une lettre minuscule.')
            .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule.')
            .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
            .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial.')
            .custom((value, { req }) => {
                if (value !== req.body.confPassword) {
                    throw new Error('Les mots de passe ne correspondent pas.');
                }
                return true;
            })
            .trim()
            .escape(),

        body('firstname')
            .notEmpty().withMessage('Le prénom est requis.')
            .trim()
            .escape(),

        body('lastname')
            .notEmpty().withMessage('Le nom est requis.')
            .trim()
            .escape(),

        body('date')
            .notEmpty().withMessage('La date de naissance est requise.')
            .isDate().withMessage('La date de naissance n\'est pas valide.'),

        body('city')
            .notEmpty().withMessage('La ville est requise.')
            .trim()
            .escape()

        ], userController.post);

router.route('/user/login')
    .get(userController.getLogin)
    .post([
        body('email')
            .notEmpty().withMessage('L\'adresse e-mail est requise')
            .isEmail().withMessage('L\'adresse e-mail doit être valide')
            .trim()
            .escape(),
        body('password')
            .notEmpty().withMessage('Le mot de passe est requis')
            .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
            .trim()
            .escape()
    ], userController.postLogin);

router.route('/user/list')
    .get(userController.list);

router.route('/user/delete/:id')
    .post(userController.delete);


router.route('/user/update/:id')
    .get(userController.getUpdate)
    .post([                
        body('email')
            .notEmpty().withMessage('Données incorrectes')
            .isEmail().withMessage('Données incorrectes')
            .trim()
            .escape(),
        body('password')
            .optional()
            .isLength({ min: 6 }).withMessage('Données incorrectes')
            .matches(/[a-z]/).withMessage('Données incorrectes')
            .matches(/[A-Z]/).withMessage('Données incorrectes')
            .matches(/[0-9]/).withMessage('Données incorrectes')
            .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Données incorrectes')
            .custom((value, { req }) => {
                if (value && value !== req.body.confPassword) {
                    throw new Error('Données incorrectes');
                }
                return true;
            })
            .trim()
            .escape(),
        body('firstname')
            .notEmpty().withMessage('Données incorrectes')
            .trim()
            .escape(),
        body('lastname')
            .notEmpty().withMessage('Données incorrectes')
            .trim()
            .escape(),
        body('date')
            .isDate().withMessage('Données incorrectes')
            .notEmpty().withMessage('Données incorrectes'),
        body('city')
            .notEmpty().withMessage('Données incorrectes')
            .trim()
            .escape(),
    ], userController.postProfileUpdate);
    
router.route('/user/profil')
    .get(isAuthenticated, userController.profil)
    .post([
        body('email')
            .optional()
            .isEmail().withMessage('L\'adresse e-mail n\'est pas valide.')
            .trim()
            .escape(),
        body('firstname')
            .optional()
            .trim()
            .escape(),
        body('lastname')
            .optional()
            .trim()
            .escape(),
        body('city')
            .optional()
            .trim()
            .escape(),
        body('oldPassword')
            .optional()
            .trim()
            .escape(),
        body('newPassword')
            .optional()
            .isLength({ min: 6 }).withMessage('Le mot de passe doit comporter au moins 6 caractères.')
            .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une lettre minuscule.')
            .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule.')
            .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
            .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial.')
            .trim()
            .escape()
    ], userController.postProfileUpdate);

router.route('/user/update-profil')
    .post([
      body('email')
        .optional()
        .isEmail().withMessage('L\'adresse e-mail n\'est pas valide.')
        .trim()
        .escape(),
      body('firstname')
        .optional()
        .trim()
        .escape(),
      body('lastname')
        .optional()
        .trim()
        .escape(),
      body('city')
        .optional()
        .trim()
        .escape(),
      body('oldPassword')
        .optional()
        .trim()
        .escape(),
      body('newPassword')
        .optional()
        .isLength({ min: 6 }).withMessage('Le mot de passe doit comporter au moins 6 caractères.')
        .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une lettre minuscule.')
        .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule.')
        .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial.')
        .custom((value, { req }) => {
          if (value !== req.body.confNewPassword) {
            throw new Error('Les nouveaux mots de passe ne correspondent pas.');
          }
          return true;
        })
        .trim()
        .escape()
    ], userController.postProfileUpdate);

router.route('/user/logout')
    .get(userController.logout);

//<-----------  Categorie Routes   ----------->
router.route('/categorie/create')
    .post(
        body('categoryName')
            .exists().withMessage('Données incorrectes')
            .trim()
            .isLength({ min: 2, max: 50 }).withMessage('Données incorrectes')
            .notEmpty().withMessage('Données incorrectes')
            .escape(),
        body('categoryDescription')
            .exists().withMessage('Données incorrectes')
            .trim()
            .isLength({ min: 10, max: 200 }).withMessage('Données incorrectes')
            .notEmpty().withMessage('Données incorrectes')
            .escape(),
        categorieController.createCat
    );

router.route('/categorie/list')
    .get(categorieController.listCat);

router.route('/categorie/delete/:id')
    .post(categorieController.catDelete);

module.exports = router;