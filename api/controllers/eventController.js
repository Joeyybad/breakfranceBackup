const Event = require("../models/eventModel");
const Comment = require("../models/commentModel");
const Group = require("../models/groupModel")
const User = require('../models/userModel')
const EventUser = require('../models/eventUserModel')
const Categorie = require('../models/categorieModel')
const { validationResult } = require('express-validator')
module.exports = {
    get: (req, res) => { // function qui renvoie la page de création d'un event
        const navEvent = true
        res.render('event_create', {navEvent});
    },
    post: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // On récupère uniquement la première erreur
                return res.render('event_create', {
                    errors: [errors.array()[0]], // Afficher seulement la première erreur
                    eventName: req.body.eventName,
                    eventDescription: req.body.eventDescription,
                    eventDate: req.body.eventDate,
                    eventTime: req.body.eventTime,
                    city: req.body.city,
                    registeredUser: req.body.registeredUser,
                    eventImage: req.file ? req.file.filename : null // Ajouter le fichier téléchargé
                });
            }
    
            await Event.create({
                eventName: req.body.eventName,
                eventDescription: req.body.eventDescription,
                eventDate: req.body.eventDate,
                eventTime: req.body.eventTime,
                city: req.body.city,
                availablePlace: req.body.availablePlace,
                eventImage: req.file ? req.file.filename : null // Ajouter le fichier téléchargé
            });
    
            res.redirect('/event/list');
        } catch (error) {
            console.error("Erreur lors de la création de l'événement :", error);
            return res.status(500).send("Une erreur est survenue lors de la création de l'événement.");
        }
    },
    read: async (req, res) => { // function pour lire un event en fonction de son id
        console.log(req.params.id);

        const navEvent = true
        try {
            let event = await Event.findByPk(req.params.id, {
                include: [
                    {
                        model: Group,
                        include: Categorie
                    },
                    {
                        model: Comment
                    }
                ]
            });

            if (!event) {
                return res.status(404).send("L'événement n'a pas été trouvé.");
            }

            event = event.toJSON();
            const result = validationResult(req);
            if (!result.isEmpty()) {
                res.render('event_read', { event, navEvent, errors: result.errors });
            } else {
                res.render('event_read', { event, navEvent });
            }
        } catch (error) {
            console.error("Une erreur s'est produite lors de la récupération de l'événement :", error);
            return res.status(500).send("Une erreur est survenue lors de la récupération de l'événement.");
        }
    },
    list: async (req, res) => {
        try {
            const navEventlist = true;
            const events = await Event.findAll({
                include: [
                    {
                        model: Group,
                        attributes: ['group_name'], 
                    },
                    {
                        model: Categorie, // Inclure le modèle de catégorie
                        attributes: ['cat_name'], 
                    }
                ],
                raw: true
            });
            console.log(events);
            res.render('event_list', { events, navEventlist });
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },
    search: async (req, res) => {
        const { count: eventCount, rows: eventResults }
          = await Event.findAndCountAll({
            where: {
              [Op.or]: [
                { event_name: { [Op.substring]: req.body.search } },
                { event_description: { [Op.substring]: req.body.search } },
                { event_date: { [Op.substring]: req.body.search } },
                { city: { [Op.substring]: req.body.search } }
              ]
            },
            raw: true
          });
        res.render('event_list', { eventCount, eventResults})
      },
   
    getUpdate: async (req, res) => { // function qui recupère l'event à modifier
        const event = await Event.findByPk(req.params.id, { raw: true })
        res.render('event_update', { event })
    },
    postUpdate: async (req, res) => { // fonction permettant de poster la modification d'event
        try {
            const [updatedRowsCount, updatedRows] = await Event.update({
                event_name: req.body.eventName, // Assurez-vous que les noms de champ correspondent
                event_description: req.body.eventDescription,
                event_date: req.body.eventDate,
                event_time: req.body.eventTime,
                city: req.body.city, 
                available_place: req.body.availablePlace
            }, {
                where: {
                    id: req.params.id
                },
                returning: true // Cette option retourne les lignes mises à jour
            });
    
            if (updatedRowsCount === 0) {
                return res.status(404).send("L'Event à mettre à jour n'a pas été trouvé.");
            }
    
            const updatedEvent = updatedRows[0]; // Première ligne mise à jour
            res.redirect('/event/list');
        } catch (error) {
            console.error("Une erreur s'est produite lors de la mise à jour de l'event:", error);
            return res.status(500).send("Une erreur est survenue lors de la mise à jour de l'event.");
        }
    },
    eventDelete: async (req, res) => { // fonction pour supprimer l'event 
        await Event.destroy({
            where: {
                id: req.params.id
            }
        })
        res.redirect('/event/list')
    },
    getAvailablePlaces: async (req, res) => { // <------- fonction pour récupèrer le nombre de place disponibles ------>
        try {
            const eventId = req.params.id;
            const event = await Event.findByPk(eventId);

            if (!event) {
                return res.status(404).send("L'événement n'a pas été trouvé.");
            } else {
                const participantsCount = await EventUser.count({
                    where: {
                        eventId: eventId
                    }
                });
                const remainingPlaces = event.availablePlace - participantsCount;
                // Si le nombre de places restantes est égal ou inférieur à zéro
                if (remainingPlaces <= 0) {
                    return res.status(403).json({ message: "Désolé, il n'y a plus de places disponibles." });
                } else {
                    return remainingPlaces;
                }
            }
        } catch (error) {
            console.error("Une erreur s'est produite lors de la récupération du nombre de places restantes :", error);
            return res.status(500).json({ error: "Erreur lors de la récupération du nombre de places restantes." });
        }
    },
    registerUserToEvent: async (req, res) => { // <----- Fonction pour inscrire l'utilisateur à l'événement ---->
        try {
            const eventId = req.params.id;
            const userId = req.session.uid;

            //Vérifier si il y a encore des places dans l'event
            const availablePlaces = await module.exports.getAvailablePlaces(req, res);

            if (availablePlaces <= 0) {
                return res.status(403).json({ message: "Désolé, il n'y a plus de places disponibles." });
            } else {

                // Vérifier si l'utilisateur est déjà inscrit à l'événement
                const existingParticipant = await EventUser.findOne({
                    
                    where: { [Op.and] : 
                        {
                        eventId: eventId,
                        userId: userId
                        }
                        
                    }
                });

                if (existingParticipant) {
                    let event = await Event.findByPk(req.params.id, {
                        include: {
                            model: Group,
                            include : Categorie
                        },
                    });
                    event = event.toJSON()
                    return res.render('event_read', {event, availablePlaces, message: "Vous êtes déjà inscrit à cet événement." });
                } else {
                    // Inscrire l'utilisateur à l'événement
                    await EventUser.create({
                        eventId: eventId,
                        userId: userId
                    });

                    let event = await Event.findByPk(req.params.id, {
                        include: {
                            model: Group,
                            include : Categorie
                        },
                    });
                    event = event.toJSON()
                    res.render('event_read', { event, availablePlaces, message: "Inscription validée" })
                     
                }
            }
        } catch (error) {
            console.error("Une erreur s'est produite lors de l'inscription de l'utilisateur à l'événement :", error);
            return res.status(500).json({ error: "Une erreur est survenue lors de l'inscription à l'événement." });
        }
    },
    getRegistratedUsers: async (req, res) => {  // <---- fonction pour récuperer la liste des utilisateurs inscris aux évenements ---->
        const navEventUser = true;
        try {
           
            const events = await Event.findAll({
                include: [{
                    model: User,
                    through: 'EventUser'
                }]
            });
    
            
            const eventsData = events.map(event => event.toJSON());
    
            res.render('event_registration', { events: eventsData, navEventUser });
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs inscrits :", error);
            res.status(500).send("Une erreur est survenue lors de la récupération des utilisateurs inscrits.");
        }
    } ,
    deleteRegistratedUsers: async(req,res)=>{ //<----- fonction pour supprimer l'utilisateur inscris à un event ---->
        
        await EventUser.destroy( { where: {
            [Op.and]: [
                { userId: req.params.userId },
                { eventId: req.params.eventId }
            ]
        } } )
        res.redirect('/event/registrated/users')
    } ,


};