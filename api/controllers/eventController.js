const Event = require("../models/eventModel");
const Group = require("../models/groupModel");
const User = require("../models/userModel");
const EventUser = require("../models/eventUserModel");
const Category = require("../models/categoryModel");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const moment = require("moment");
module.exports = {
  get: async (req, res) => {
    // <-------------function qui renvoie la page de création d'un event------------>
    const navEvent = true;
    const categories = await Category.findAll({ raw: true });
    res.render("event_create", { navEvent, categories });
  },
  postEvent: async (req, res) => {
    // <---- fonction de création d'event ---->
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render("event_create", { errors: errors.array() });
      }
      const event = await Event.findOne({
        where: {
          event_name: req.body.eventName.trim(),
          event_time: req.body.eventTime,
          event_date: req.body.eventDate,
          city: req.body.city,
        },
      });
      console.log(req.body);
      console.log(req.body.eventName);
      console.log("Correspondance trouvé :", event); // log affichage de la correspondance

      if (event !== null) {
        const error = "Cet événement existe déjà";
        return res.render("event_create", { error: error });
      } else {
        const eventImage = req.file
          ? `http://localhost:3000/${req.file.path}`
          : null;
        const eventcreated = await Event.create({
          event_name: req.body.eventName.trim(),
          event_description: req.body.eventDescription.trim(),
          event_date: req.body.eventDate,
          event_time: req.body.eventTime,
          city: req.body.city,
          available_place: req.body.availablePlace,
          event_image: eventImage,
          categoryId: req.body.catId,
          userId: req.session.uid,
          // groupId: req.body.groupId
        });

        console.log("Événement créé :", eventcreated); // log confirmation de la création d'un évenement

        return res.status(200).redirect("/event/list");
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'événement :", error);
      return res
        .status(500)
        .send("Une erreur est survenue lors de la création de l'événement.");
    }
  },
  read: async (req, res) => {
    // <------------ function pour lire un event en fonction de son id ------------>
    console.log(req.params.id);

    const navEvent = true;
    try {
      let event = await Event.findByPk(req.params.id, {
        include: [
          {
            model: Category,
          },
        ],
      });

      if (!event) {
        return res.status(404).send("L'événement n'a pas été trouvé.");
      }

      event = event.toJSON();
      const availablePlaces = await module.exports.getAvailablePlaces(req, res);
      const result = validationResult(req);
      if (!result.isEmpty()) {
        res.render("event_read", { event, navEvent, errors: result.errors });
      } else {
        res.render("event_read", { event, navEvent, availablePlaces });
      }
    } catch (error) {
      console.error(
        "Une erreur s'est produite lors de la récupération de l'événement :",
        error
      );
      return res
        .status(500)
        .send(
          "Une erreur est survenue lors de la récupération de l'événement."
        );
    }
  },
  list: async (req, res) => {
    // <------------ function pour afficher les event en liste ------------>
    try {
      const navEventlist = true;
      const userId = req.session.uid; // ID de l'utilisateur connecté
      const events = await Event.findAll({
        include: [{ model: Category }],
        order: [["createdAt", "DESC"]],
        raw: true,
      });
      res.render("event_list", { events, navEventlist, userId });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
  search: async (req, res) => {
    const { search: keyword } = req.body;
    let events = [];
    let navEventlist = true;

    try {
      if (keyword && keyword.trim() !== "") {
        events = await Event.findAll({
          where: {
            [Op.or]: [
              { event_name: { [Op.substring]: keyword } },
              { event_description: { [Op.substring]: keyword } },
              { event_date: { [Op.substring]: keyword } },
              { city: { [Op.substring]: keyword } },
            ],
          },
          include: [{ model: Category }],
          raw: true,
        });
      } else {
        events = await Event.findAll({
          include: [{ model: Category }],
          order: [["createdAt", "DESC"]],
          raw: true,
        });
      }

      res.render("event_list", { events, navEventlist, keyword });
    } catch (error) {
      console.error("Erreur lors de la recherche des événements:", error);
      res
        .status(500)
        .json({ error: "Erreur lors de la recherche des événements" });
    }
  },

  getUpdate: async (req, res) => {
    //<--------------- function recupere l'event à modifier --------------->
    const event = await Event.findByPk(req.params.id, { raw: true });
    res.render("event_update", { event });
  },
  postUpdate: async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) {
        return res
          .status(404)
          .send("L'événement à mettre à jour n'a pas été trouvé.");
      }

      const updatedData = {
        event_name: req.body.eventName.trim(),
        event_description: req.body.eventDescription.trim(),
        event_date: req.body.eventDate,
        event_time: req.body.eventTime,
        available_place: req.body.availablePlace,
        city: req.body.city,
      };

      if (req.file) {
        updatedData.eventImg = `http://localhost:3000/uploads/${req.file.filename}`;
      } else {
        updatedData.eventImg = req.body.currentEventImg; // Use the current image if no new file is uploaded
      }

      const [updatedRowsCount, updatedRows] = await Event.update(updatedData, {
        where: { id: req.params.id },
        returning: true, // Cette option retourne les lignes mises à jour
      });

      if (updatedRowsCount === 0) {
        return res
          .status(404)
          .send("L'événement à mettre à jour n'a pas été trouvé.");
      }

      res.redirect("/event/list");
    } catch (error) {
      console.error(
        "Une erreur s'est produite lors de la mise à jour de l'événement:",
        error
      );
      return res
        .status(500)
        .send("Une erreur est survenue lors de la mise à jour de l'événement.");
    }
  },
  eventDelete: async (req, res) => {
    //<------------ fonction pour supprimer l'event ----------->
    await Event.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.redirect("/event/list");
  },
  getAvailablePlaces: async (req, res) => {
    // <------- fonction pour récupèrer le nombre de place disponibles ------>
    try {
      const eventId = req.params.id;
      const event = await Event.findByPk(eventId);

      if (!event) {
        return res.status(404).send("L'événement n'a pas été trouvé.");
      } else {
        const participantsCount = await EventUser.count({
          where: {
            eventId: eventId,
          },
        });
        const remainingPlaces = event.available_place - participantsCount;
        // Si le nombre de places restantes est égal ou inférieur à zéro
        if (remainingPlaces <= 0) {
          return res
            .status(403)
            .json({ message: "Désolé, il n'y a plus de places disponibles." });
        } else {
          return remainingPlaces;
        }
      }
    } catch (error) {
      console.error(
        "Une erreur s'est produite lors de la récupération du nombre de places restantes :",
        error
      );
      return res.status(500).json({
        error: "Erreur lors de la récupération du nombre de places restantes.",
      });
    }
  },
  registerUserToEvent: async (req, res) => {
    try {
      const eventId = req.params.id;
      const userId = req.session.uid;

      // Vérifier s'il y a encore des places disponibles
      const availablePlaces = await module.exports.getAvailablePlaces(req, res);

      if (availablePlaces === null) {
        return res.status(500).json({
          message: "Erreur lors de la vérification des places disponibles.",
        });
      }

      if (availablePlaces <= 0) {
        return res
          .status(403)
          .json({ message: "Désolé, il n'y a plus de places disponibles." });
      }

      // Vérifier si l'utilisateur est déjà inscrit à l'événement
      const existingParticipant = await EventUser.findOne({
        where: {
          [Op.and]: [{ eventId: eventId }, { userId: userId }],
        },
      });

      let event = await Event.findByPk(eventId, {
        include: [{ model: Category }],
      });
      event = event.toJSON();

      if (existingParticipant) {
        return res.render("event_read", {
          event,
          availablePlaces,
          message: "Vous êtes déjà inscrit à cet événement.",
        });
      } else {
        // Inscrire l'utilisateur à l'événement
        await EventUser.create({
          eventId: eventId,
          userId: userId,
        });

        // Mettre à jour les places disponibles
        return res.render("event_read", {
          event,
          availablePlaces,
          message: "Inscription validée",
        });
      }
    } catch (error) {
      console.error(
        "Une erreur s'est produite lors de l'inscription de l'utilisateur à l'événement :",
        error
      );
      return res.status(500).json({
        error: "Une erreur est survenue lors de l'inscription à l'événement.",
      });
    }
  },
  getRegistratedUsers: async (req, res) => {
    const navEventUser = true;
    const userId = req.session.uid;
    const isAdmin = req.session.isAdmin;
    try {
      const events = await Event.findAll({
        include: [
          {
            model: User,
            through: "EventUser",
          },
        ],
      });

      const eventsData = events.map((event) => event.toJSON());
      console.log(JSON.stringify(eventsData, null, 2)); // Utilisation de JSON.stringify pour afficher les objets en détail

      res.render("event_registration", {
        events: eventsData,
        navEventUser,
        userId,
        isAdmin,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des utilisateurs inscrits :",
        error
      );
      res
        .status(500)
        .send(
          "Une erreur est survenue lors de la récupération des utilisateurs inscrits."
        );
    }
  },
  deleteRegistratedUsers: async (req, res) => {
    //<----- fonction pour supprimer l'utilisateur inscris à un event ---->

    await EventUser.destroy({
      where: {
        [Op.and]: [
          { userId: req.params.userId },
          { eventId: req.params.eventId },
        ],
      },
    });
    res.redirect("/event/registrated/users");
  },
};
