const { Op } = require("sequelize");
const User = require("../models/userModel");
const Event = require("../models/eventModel");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const { Request, Response } = require("express");
const EventUser = require("../models/eventUserModel");

module.exports = {
  get: (req, res) => {
    //

    const navUser = true;
    res.render("register", { navUser });
  },
  post: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        return res.render("register", { error: firstError });
      }

      const email = req.body.email ? req.body.email.trim() : "";
      const password = req.body.password ? req.body.password.trim() : "";
      const firstname = req.body.firstname ? req.body.firstname.trim() : "";
      const lastname = req.body.lastname ? req.body.lastname.trim() : "";
      const birthdate = req.body.date ? req.body.date.trim() : "";
      const city = req.body.city ? req.body.city.trim() : "";
      const CGU = req.body.CGU ? true : false;

      const user = await User.findOne({
        where: { email: email },
      });

      if (user) {
        const error = "Ces identifiants existent déjà";
        return res.render("register", { error });
      } else {
        const createdUser = await User.create({
          firstname: firstname,
          lastname: lastname,
          email: email,
          birthdate: birthdate,
          city: city,
          password: password,
          isConditionChecked: CGU,
        });
        return res.redirect("/user/login");
      }
      console.log(req.body);
    } catch (error) {
      console.error(
        "Une erreur s'est produite lors de l'inscription de l'utilisateur :",
        error
      );
      return res
        .status(500)
        .send("Une erreur est survenue lors de l'inscription.");
    }
  },
  list: async (req, res) => {
    // page avec list les user
    const users = await User.findAll({ raw: true });
    const navUserList = true;
    res.render("user_list", { users, navUserList });
  },
  delete: async (req, res) => {
    await User.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.redirect("/user/list");
  },
  postUpdate: async (req, res) => {
    const user = await User.findByPk(req.params.id, { raw: true }); // je cherche quel utilisateur je vais modifier
    if (!req.body.oldPassword) {
      bcrypt.compare(
        req.body.password,
        user.password,
        async function (err, result) {
          //comparer le contenu de req.body et comparer le cryptage bcrypt
          if (!result) {
            // si la comparaison est mauvaise on renvoie a la page avant
            res.redirect("back");
          } else {
            // si c'est ok alors on modifie l'utilisateur
            await User.update(
              {
                username: req.body.username,
                email: req.body.email,
              },
              {
                where: {
                  id: req.params.id,
                },
              }
            );
            res.redirect("/user/list");
          }
        }
      );
    } else {
      //comparer l'ancien mot de passe
      bcrypt.compare(
        req.body.oldPassword,
        user.password,
        async (err, result) => {
          if (!result) {
            res.redirect("back");
          } else {
            //si ok
            //vérifié si le newpassword =  newconfpas
            if (req.body.newPassword !== req.body.confNewPassword) {
              res.redirect("back");
            } else {
              //enregistre nouveau mot de passe
              await User.update(
                {
                  password: req.body.newPassword,
                },
                { where: { id: req.params.id }, individualHooks: true }
              );
              res.redirect("/user/list");
            }
          }
        }
      );
    }
  },
  getLogin: (req, res) => {
    res.render("login");
  },
  postLogin: async (req, res) => {
    const navLogin = true;
    try {
      const { email, password } = req.body;

      // Recherche de l'utilisateur par email
      const user = await User.findOne({ where: { email: email.trim() } });
      if (!user) {
        return res.render("login", {
          error: { msg: "Utilisateur non trouvé", path: "email" },
        });
      }

      const isMatch = await bcrypt.compare(password.trim(), user.password);
      if (!isMatch) {
        return res.render("login", {
          error: { msg: "Mot de passe incorrect", path: "password" },
        });
      }

      // Connexion réussie, stockage des informations dans la session
      req.session.firstname = user.firstname;
      req.session.uid = user.id;
      req.session.isAdmin = user.isAdmin;
      req.session.isModerator = user.isModerator;

      res.redirect("/");
      return navLogin;
    } catch (error) {
      console.error(
        "Une erreur s'est produite lors de la connexion de l'utilisateur :",
        error
      );
      res.status(500).send("Une erreur est survenue lors de la connexion.");
    }
  },

  profil: async (req, res) => {
    try {
      // Chercher l'utilisateur correspondant à l'id
      const user = await User.findOne({
        where: { id: req.session.uid }, // Utiliser l'id de l'utilisateur connecté
        include: [
          {
            model: Event,
            through: { model: EventUser }, // Inclure les événements auxquels l'utilisateur est associé
          },
        ],
      });

      if (!user) {
        return res.status(404).send("Utilisateur non trouvé.");
      }
      console.log(user);

      res.render("profil", { user });
    } catch (error) {
      console.error("Erreur lors de la récupération du profil :", error);
      return res
        .status(500)
        .send("Une erreur est survenue lors de la récupération du profil.");
    }
  },
  postProfileUpdate: async (req, res) => {
    try {
      const userId = req.session.uid;
      const {
        email,
        firstname,
        lastname,
        city,
        oldPassword,
        newPassword,
        confPassword,
      } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).send("Utilisateur non trouvé.");
      }

      const updatedData = {
        email: email ? email.trim() : user.email,
        firstname: firstname ? firstname.trim() : user.firstname,
        lastname: lastname ? lastname.trim() : user.lastname,
        city: city ? city.trim() : user.city,
      };

      // Mise à jour du mot de passe si fourni
      if (newPassword || oldPassword || confPassword) {
        // Vérification de l'ancien mot de passe
        if (!oldPassword) {
          return res.render("profil", {
            error: { msg: "Veuillez fournir l'ancien mot de passe." },
            user,
          });
        }
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
          return res.render("profil", {
            error: { msg: "L'ancien mot de passe est incorrect." },
            user,
          });
        }

        // Vérification des nouveaux mots de passe
        if (newPassword !== confPassword) {
          return res.render("profil", {
            error: { msg: "Les nouveaux mots de passe ne correspondent pas." },
            user,
          });
        }
      }
      // Mise à jour des données de l'utilisateur
      await user.update(updatedData);
      console.log("Informations mises à jour :", updatedData);

      res.redirect(`/user/profil/${req.session.uid}`);
    } catch (error) {
      console.error(
        "Une erreur s'est produite lors de la mise à jour du profil :",
        error
      );
      res
        .status(500)
        .send("Une erreur est survenue lors de la mise à jour du profil.");
    }
  },
  removeregister: async (req, res) => {
    await EventUser.destroy({
      where: {
        [Op.and]: [
          { userId: req.params.userId },
          { eventId: req.params.eventId },
        ],
      },
    });
    res.redirect("/");
  },

  denied: (req,res)=>{
    res.render('acces_denied')
  },

  logout: (req, res) => {
    req.session.destroy();
    res.redirect("/");
  },
};
