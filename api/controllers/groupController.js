const Group = require("../models/groupModel");
const User = require("../models/userModel");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

module.exports = {
  get: async (req, res) => {
    // <---- affichage de la page group ---->
    const navGroupCreate = true;
    res.render("group_create", { navGroupCreate });
  },

  list: async (req, res) => {
    // <---- montre la liste des groupes existants/displays the existing group ---->
    const navGrouplist = true;

    try {
      const groups = await Group.findAll({
        order: [["group_name", "ASC"]], // Tri par ordre alphabétique du nom du groupe
        raw: true,
      });

      res.render("group_list", { groups, navGrouplist });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la liste des groupes :",
        error
      );
      return res
        .status(500)
        .send(
          "Une erreur est survenue lors de la récupération de la liste des groupes."
        );
    }
  },

  read: async (req, res) => {
    // <---- afficher un groupe par son ID ---->
    try {
      const userId = req.session.uid;
      let group = await Group.findByPk(req.params.id);
      if (!group) {
        return res.status(404).send("Le groupe n'a pas été trouvé.");
      } else {
        group = group.toJSON();
        const navGroup = true;
        res.render("group", { group, navGroup, userId });
        console.log(group);
      }
    } catch (error) {
      console.error("Erreur lors de la lecture du groupe :", error);
      return res
        .status(500)
        .send("Une erreur est survenue lors de la lecture du groupe.");
    }
  },

  postGroup: async (req, res) => {
    // <---- fonction de création du groupe ---->
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render("group_create", { errors: errors.array() });
      }
      const group = await Group.findOne({
        where: {
          group_name: req.body.groupName.trim(),
        },
      });
      console.log(req.body);
      console.log(req.body.groupName);
      console.log("Correspondance trouvé :", group);

      if (group !== null) {
        const error = "Cet groupe existe déjà";
        return res.render("group_create", { error: error });
      } else {
        const groupcreated = await Group.create({
          group_name: req.body.groupName.trim(),
          group_description: req.body.groupDescription.trim(),
          group_date: req.body.groupDate,
          group_time: req.body.groupTime,
          group_city: req.body.city,
          group_img: req.file ? req.file.path : null,
          userId: req.session.uid,
        });

        console.log("Événement créé :", groupcreated); // log confirmation de la création d'un évenement
        return res.redirect("/group/list");
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'événement :", error);
      return res
        .status(500)
        .send("Une erreur est survenue lors de la création de l'événement.");
    }
  },
  groupUpdate: async (req, res) => {
    try {
      const group = await Group.findByPk(req.params.id);
      if (!group) {
        return res.status(404).send("Le groupe n'a pas été trouvé.");
      }

      const updatedData = {
        group_name: req.body.groupName.trim(),
        group_description: req.body.groupDescription.trim(),
        group_city: req.body.city,
      };

      if (req.file) {
        updatedData.group_img = `http://localhost:3000/uploads/${req.file.filename}`;
      }

      await group.update(updatedData);
      console.log("Groupe mis à jour :", group);
      return res.redirect(`/group/${req.params.id}`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du groupe :", error);
      return res
        .status(500)
        .send("Une erreur est survenue lors de la mise à jour du groupe.");
    }
  },
  search: async (req, res) => {
    console.log(req.body.search);
    const { count: groupCount, rows: groupResults } =
      await Group.findAndCountAll({
        where: {
          [Op.or]: [
            { group_name: { [Op.substring]: req.body.search } },
            { group_description: { [Op.substring]: req.body.search } },
            { group_city: { [Op.substring]: req.body.search } },
          ],
        },
        raw: true,
      });
    res.render("group_list", { groupResults, groupCount });
  },
};
