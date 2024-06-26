const express = require("express");
const { body, param } = require("express-validator");
const protectSearch = require("./middleware/protectSearch");
const isAuthenticated = require("./middleware/isAuthenticated");
const upload = require("../multer-config");

const homeController = require("./controllers/homeController");
const eventController = require("./controllers/eventController");
const userController = require("./controllers/userController");
const groupController = require("./controllers/groupController");
const categoryController = require("./controllers/categoryController");

const router = express.Router();

//<-----------  Home Routes   ----------->
router.route("/").get(homeController.get);
router.route("/faq").get(homeController.faq);

router.route("/conditions").get(homeController.conditions);

router.route("/search").post(protectSearch, homeController.search);

router.route("/events/searchByCity").post(homeController.searchByCity);

//<-----------  Event Routes   ----------->
router
  .route("/event/create")
  .get(isAuthenticated, eventController.get)
  .post(
    upload.single("eventImg"),
    body("eventName")
      .exists()
      .withMessage("Données incorrectes")
      .trim()
      .isLength({ min: 2, max: 20 })
      .withMessage("Données incorrectes")
      .notEmpty()
      .withMessage("Données incorrectes")
      .escape(),
    body("eventDescription")
      .exists()
      .withMessage("Données incorrectes")
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage("Données incorrectes")
      .notEmpty()
      .withMessage("Données incorrectes")
      .escape(),
    body("eventDate")
      .isDate()
      .withMessage("Données incorrectes")
      .notEmpty()
      .withMessage("Données incorrectes"),
    body("eventTime")
      .matches(/^([01]\d|2[0-3]):?([0-5]\d)$/)
      .withMessage("Données incorrectes"),
    body("availablePlace").isInt({ min: 1 }).withMessage("Données incorrectes"),
    body("city").notEmpty().withMessage("Données incorrectes").escape(),
    eventController.postEvent
  );

router.route("/event/search").post(protectSearch, eventController.search);

router
  .route("/event/read/:id")
  .get(
    [param("id").exists().withMessage("Données incorrectes")],
    eventController.read
  );

router.route("/event/list").get(eventController.list);

router
  .route("/event/update/:id")
  .get(isAuthenticated, eventController.getUpdate)
  .post(
    isAuthenticated,
    upload.single("eventImg"), // gestion img Multer
    body("eventName")
      .exists()
      .withMessage("Données incorrectes")
      .trim()
      .isLength({ min: 2, max: 20 })
      .withMessage("Données incorrectes")
      .notEmpty()
      .withMessage("Données incorrectes")
      .escape(),
    body("eventDescription")
      .exists()
      .withMessage("Données incorrectes")
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage("Données incorrectes")
      .notEmpty()
      .withMessage("Données incorrectes")
      .escape(),
    body("eventDate")
      .isDate()
      .withMessage("Données incorrectes")
      .notEmpty()
      .withMessage("Données incorrectes"),
    body("eventTime")
      .matches(/^([01]\d|2[0-3]):?([0-5]\d)$/)
      .withMessage("Données incorrectes"),
    body("availablePlace").isInt({ min: 1 }).withMessage("Données incorrectes"),
    body("city").notEmpty().withMessage("Données incorrectes").escape(),
    eventController.postUpdate
  );

router
  .route("/event/delete/:id")
  .post(isAuthenticated, eventController.eventDelete);

router
  .route("/event/:id/register")
  .post(isAuthenticated, eventController.registerUserToEvent);

router
  .route("/user/unregister/:userId/:eventId")
  .get(isAuthenticated, userController.removeregister);

router
  .route("/event/registrated/users")
  .get(isAuthenticated, eventController.getRegistratedUsers);

router
  .route("/event/:eventId/user/:userId/delete")
  .post(isAuthenticated, eventController.deleteRegistratedUsers);

//<----------- Group Routes   ----------->
router.route("/group/list").get(groupController.list);

router.route("/group/search").post(protectSearch, groupController.search);

router.route("/group/read/:id").get(groupController.read);

router
  .route("/group/create")
  .get(isAuthenticated, groupController.get)
  .post(
    isAuthenticated,
    upload.single("imgGroup"), // Middleware Multer pour gérer le téléchargement de l'image
    body("groupName")
      .exists()
      .withMessage("Le nom du groupe est requis.")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Le nom du groupe doit contenir entre 2 et 50 caractères.")
      .notEmpty()
      .withMessage("Le nom du groupe ne peut pas être vide.")
      .escape(),
    body("groupDescription")
      .exists()
      .withMessage("La description du groupe est requise.")
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage(
        "La description du groupe doit contenir entre 10 et 200 caractères."
      )
      .notEmpty()
      .withMessage("La description du groupe ne peut pas être vide.")
      .escape(),
    body("city")
      .exists()
      .withMessage("La ville du groupe est requise.")
      .trim()
      .notEmpty()
      .withMessage("La ville du groupe ne peut pas être vide.")
      .escape(),
    groupController.postGroup
  );

router.route("/group/:id").get(groupController.read);
router
  .route("/group/update/:id")
  .post(
    isAuthenticated,
    upload.single("imgGroup"),
    groupController.groupUpdate
  );

//<-----------  User Routes   ----------->
router
  .route("/user/register")
  .get(userController.get)
  .post(
    [
      body("email")
        .notEmpty()
        .withMessage("L'adresse e-mail est requise.")
        .isEmail()
        .withMessage("L'adresse e-mail n'est pas valide.")
        .trim()
        .escape(),

      body("password")
        .isLength({ min: 6 })
        .withMessage("Le mot de passe doit comporter au moins 8 caractères.")
        .matches(/[a-z]/)
        .withMessage(
          "Le mot de passe doit contenir au moins une lettre minuscule."
        )
        .matches(/[A-Z]/)
        .withMessage(
          "Le mot de passe doit contenir au moins une lettre majuscule."
        )
        .matches(/[0-9]/)
        .withMessage("Le mot de passe doit contenir au moins un chiffre.")
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage(
          "Le mot de passe doit contenir au moins un caractère spécial."
        )
        .custom((value, { req }) => {
          if (value !== req.body.confPassword) {
            throw new Error("Les mots de passe ne correspondent pas.");
          }
          return true;
        })
        .trim()
        .escape(),

      body("firstname")
        .notEmpty()
        .withMessage("Le prénom est requis.")
        .trim()
        .escape(),

      body("lastname")
        .notEmpty()
        .withMessage("Le nom est requis.")
        .trim()
        .escape(),

      body("date")
        .notEmpty()
        .withMessage("La date de naissance est requise.")
        .isDate()
        .withMessage("La date de naissance n'est pas valide."),

      body("city")
        .notEmpty()
        .withMessage("La ville est requise.")
        .trim()
        .escape(),

      body("CGU").custom((value) => {
        if (!value) {
          throw new Error(
            "Vous devez accepter les conditions générales d'utilisation."
          );
        }
        return true;
      }),
    ],
    userController.post
  );

router
  .route("/user/login")
  .get(userController.getLogin)
  .post(
    [
      body("email")
        .notEmpty()
        .withMessage("L'adresse e-mail est requise")
        .isEmail()
        .withMessage("L'adresse e-mail invalide")
        .trim()
        .escape(),
      body("password")
        .notEmpty()
        .withMessage("Le mot de passe est requis")
        .isLength({ min: 8 })
        .withMessage("Le mot de passe ne respecte pas les critères requis")
        .trim()
        .escape(),
    ],
    userController.postLogin
  );

router.route("/user/list").get(isAuthenticated, userController.list);

router.route("/user/update").post(
  isAuthenticated,
  [
    body("email")
      .notEmpty()
      .withMessage("Données incorrectes")
      .isEmail()
      .withMessage("Données incorrectes")
      .trim()
      .escape(),
    body("password")
      .optional() // Le mot de passe est facultatif
      .isLength({ min: 6 })
      .withMessage("Données incorrectes")
      .matches(/[a-z]/)
      .withMessage("Données incorrectes")
      .matches(/[A-Z]/)
      .withMessage("Données incorrectes")
      .matches(/[0-9]/)
      .withMessage("Données incorrectes")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Données incorrectes")
      .custom((value, { req }) => {
        if (value && value !== req.body.confPassword) {
          throw new Error("Les mots de passe ne correspondent pas.");
        }
        return true;
      })
      .trim()
      .escape(),
    body("firstname")
      .notEmpty()
      .withMessage("Données incorrectes")
      .trim()
      .escape(),
    body("lastname")
      .notEmpty()
      .withMessage("Données incorrectes")
      .trim()
      .escape(),
    body("date")
      .isDate()
      .withMessage("Données incorrectes")
      .notEmpty()
      .withMessage("Données incorrectes"),
    body("city").notEmpty().withMessage("Données incorrectes").trim().escape(),
  ],
  userController.postProfileUpdate
);

router.route("/user/profil/:id").get(isAuthenticated, userController.profil);

router.route("/user/logout").get(userController.logout);

router.route("/user/list").get(userController.list);

router.route("/access-denied").get(userController.denied);
//<-----------  category Routes   ----------->
router
  .route("/category/create")
  .get(isAuthenticated, categoryController.createCat)
  .post(
    isAuthenticated,
    body("catName")
      .exists()
      .withMessage("Données incorrectes")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Données incorrectes")
      .notEmpty()
      .withMessage("Données incorrectes")
      .escape(),
    categoryController.postCat
  );
router
  .route("/category/update/:id")
  .get(isAuthenticated, categoryController.getCatUpdate)
  .post(
    [
      body("catName")
        .exists()
        .trim()
        .isLength({ min: 2, max: 20 })
        .withMessage("Contenu incorrecte")
        .notEmpty()
        .withMessage("Ce champ ne doit pas être vide.")
        .escape(),
    ],
    categoryController.postCatUpdate
  );

router.route("/category/list").get(isAuthenticated, categoryController.listCat);

router
  .route("/category/delete/:id")
  .post(isAuthenticated, categoryController.catDelete);

module.exports = router;
