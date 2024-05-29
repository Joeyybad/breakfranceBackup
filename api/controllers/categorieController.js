const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const Categorie = require('../models/categorieModel');

module.exports = {
    listCat: async (req, res) => {  // <------ liste des catégories  ------>
        try {
            const categories = await Categorie.findAll({ raw: true });
            console.log(categories);
            res.render('category_list', { categories });
        } catch (error) {
            console.error("Erreur lors de la récupération des catégories :", error);
            res.status(500).send("Une erreur est survenue lors de la récupération des catégories.");
        }
    },
    
    createCat: async (req, res) => { // <---- affichage de la page de création des catégories ---->
        const navCatCreate = true;
        res.render('category_create', { navCatCreate });
    },
    
    postCat: async (req, res) => { // <---- création de la catégorie ---->
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('category_create', { errors: errors.array() });
            }

            const catName = req.body.catName.trim();

            // Rechercher si la catégorie existe déjà
            const catCorres = await Categorie.findOne({
                where: {
                    cat_name: catName
                }
            });

            console.log("Correspondance trouvée :", catCorres); 

            if (catCorres !== null) {
                const error = "Cette catégorie existe déjà";
                return res.render('category_create', { error: error });
            } else {
                // Créer la nouvelle catégorie
                const categoryCreated = await Categorie.create({
                    cat_name: catName
                });
                console.log("Catégorie créée :", categoryCreated); 
                return res.redirect('/category/list');
            }
        } catch (error) {
            console.error("Erreur lors de la création de la catégorie :", error);
            return res.status(500).send("Une erreur est survenue lors de la création de la catégorie.");
        }
    },    
    getCatUpdate: async (req, res) => {  //<---- récupère une catégorie spécifique par son ID ---->
        try {
            const category = await Categorie.findByPk(req.params.id, { raw: true });
            if (!category) {
                return res.status(404).send("La catégorie à modifier n'a pas été trouvée.");
            }
            res.render('category_update', { category });
        } catch (error) {
            console.error("Erreur lors de la récupération de la catégorie :", error);
            return res.status(500).send("Une erreur est survenue lors de la récupération de la catégorie.");
        }
    },

    postCatUpdate: async (req, res) => { //<---- met à jour une catégorie ---->
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const category = await Categorie.findByPk(req.params.id, { raw: true });
                return res.render('category_update', { category, errors: errors.array() });
            }
    
            const [updatedRowsCount, updatedRows] = await Categorie.update({
                cat_name: req.body.catName.trim(),
            }, {
                where: {
                    id: req.params.id
                },
                returning: true
            });
    
            if (updatedRowsCount === 0) {
                return res.status(404).send("La catégorie à modifier n'a pas été trouvée.");
            }
    
            const updatedCat = updatedRows[0];
            res.redirect('/category/list');
        } catch (error) {
            console.error("Une erreur s'est produite lors de la mise à jour de la catégorie :", error);
            return res.status(500).send("Une erreur est survenue lors de la mise à jour de la catégorie.");
        }
    },

    catDelete: async (req, res) => {  // <-----supprime une catégorie spécifique par son ID ------>
        try {
            const rowsDeleted = await Categorie.destroy({
                where: {
                    id: req.params.id
                }
            });
    
            if (rowsDeleted === 0) {
                return res.status(404).send("La catégorie à supprimer n'a pas été trouvée.");
            }
    
            res.redirect('/category/list');
        } catch (error) {
            console.error("Une erreur s'est produite lors de la suppression de la catégorie :", error);
            return res.status(500).send("Une erreur est survenue lors de la suppression de la catégorie.");
        }
    }
}