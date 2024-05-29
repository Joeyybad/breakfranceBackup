const Group = require("../models/groupModel");
const GroupUser = require('../models/groupUserModel');
const User = require('../models/userModel');
const { validationResult } = require('express-validator');

module.exports = {
    get: async (req, res) => { // <---- affichage de la page group ---->
        const navGroupCreate = true;
        res.render('group_create', { navGroupCreate });
    },

    list: async (req, res) => { 
        // <---- montre la liste des groupes existants/displays the existing group ---->
        const navGrouplist = true;
        
        try {
            const groups = await Group.findAll({ 
                order: [['group_name', 'ASC']], // Tri par ordre alphabétique du nom du groupe
                raw: true 
            });
            
            res.render('group_list', { groups, navGrouplist });
        } catch (error) {
            console.error("Erreur lors de la récupération de la liste des groupes :", error);
            return res.status(500).send("Une erreur est survenue lors de la récupération de la liste des groupes.");
        }
    },

    read: async (req, res) => { // <---- afficher un groupe par son ID ---->
        try {
            let group = await Group.findByPk(req.params.id);
            if (!group) {
                return res.status(404).send("Le groupe n'a pas été trouvé.");
            } else {
                group = group.toJSON();
                const navGroup = true;
                res.render('group', { group, navGroup });
            }
        } catch (error) {
            console.error("Erreur lors de la lecture du groupe :", error);
            return res.status(500).send("Une erreur est survenue lors de la lecture du groupe.");
        }
    },

     create: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // On récupère uniquement la première erreur
                return res.render('group_create', {
                    errors: [errors.array()[0]], // Afficher seulement la première erreur
                    groupName: req.body.groupName,
                    groupDescription: req.body.groupDescription,
                    city: req.body.city,
                    group_img: req.file ? req.file.filename : null
                });
            }
    
            const groupExists = await Group.findOne({
                where: {
                    groupName: req.body.groupName.trim()
                }
            });
    
            if (groupExists) {
                const error = "Ce groupe existe déjà.";
                return res.render('group_create', {
                    errors: [{ msg: error }],
                    groupName: req.body.groupName,
                    groupDescription: req.body.groupDescription,
                    city: req.body.city,
                    group_img: req.file ? req.file.filename : null
                });
            }
    
            const newGroup = await Group.create({
                groupName: req.body.groupName.trim(),
                groupDescription: req.body.groupDescription.trim(),
                group_img: req.file ? req.file.filename : null,
                group_city: req.body.city.trim()
            });
    
            const groupId = newGroup.id;
    
            // Ajoute l'utilisateur en tant que modérateur du groupe
            await GroupUser.create({
                groupId: groupId,
                userId: req.user.id,
                isModerator: true
            });
            
            console.log("Groupe créé :", newGroup); // log confirmation de la création du groupe
            return res.redirect('/group/list');
        } catch (error) {
            console.error("Erreur lors de la création du groupe :", error);
            return res.status(500).send("Une erreur est survenue lors de la création du groupe.");
        }
    },
    groupUpdate: async (req, res) => {
        const groupId = req.params.groupId;  // Supposons que l'ID du groupe soit passé en tant que paramètre
        const userId = req.user.id;  // Supposons que l'ID de l'utilisateur soit récupéré depuis le token ou la session
        const { group_name, group_description, group_city, group_img } = req.body;
    
        try {
            // Vérification si l'utilisateur est modérateur de ce groupe
            const groupUser = await GroupUser.findOne({
                where: {
                    groupId: groupId,
                    userId: userId,
                    isModerator: true
                }
            });
    
            if (!groupUser) {
                return res.status(403).json({ error: 'Accès refusé : Vous devez être modérateur de ce groupe pour le modifier.' });
            }
    
            // Mise à jour des informations du groupe
            const group = await Group.findByPk(groupId);
            if (!group) {
                return res.status(404).json({ error: 'Groupe non trouvé.' });
            }
    
            group.group_name = group_name || group.group_name;
            group.group_description = group_description || group.group_description;
            group.group_city = group_city || group.group_city;
            group.group_img = group_img || group.group_img;
    
            await group.save();
    
            res.redirect(`/group/read/${id}`)
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour du groupe' });
        }
    },
    search: async (req, res) => {
        console.log(req.body.search);
        const { count: groupCount, rows: groupResults } = await Group.findAndCountAll({
            where: {
                [Op.or]: [
                    { group_name: { [Op.substring]: req.body.search } },
                    { group_description: { [Op.substring]: req.body.search } },
                    { group_city: { [Op.substring]: req.body.search } }
                ]
            },
            raw: true
        });
        res.render('group_list', { groupResults, groupCount });
    }
}