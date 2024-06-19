const Event = require("../models/eventModel")
const { Op } = require('sequelize')


module.exports = {
  get: async (req, res) => {
    console.log(req.session);
    const navHome = true;
    const events = await Event.findAll({
        raw: true,
        limit: 3, 
        order: [['createdAt', 'DESC']]
    });
    res.render('home', { events, navHome });
},
  search: async (req, res) => {
    const { search: keyword } = req.body;
    try {
        const { count: eventCount, rows: eventResults } = await Event.findAndCountAll({
            where: {
                [Op.or]: [
                    { event_name: { [Op.substring]: keyword } },
                    { city: { [Op.substring]: keyword } }
                ]
            },
            raw: true
        });

        res.render('home', { eventCount, eventResults });
    } catch (error) {
        console.error('Erreur lors de la recherche des événements:', error);
        res.status(500).json({ error: 'Erreur lors de la recherche des événements' });
    }
},
searchByCity: async (req, res) => {
  const { city } = req.body;
  try {
    const events = await Event.findAll({
      where: {
        city: {
          [Op.substring]: city
        }
      },
      raw: true
    });
    res.json(events);
  } catch (error) {
    console.error('Erreur lors de la recherche des événements:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche des événements' });
  }
},
  faq: async (req, res) => {
    const navFaq = true
    res.render('faq', { navFaq })
  },
  conditions: async(req,res)=>{
    const navCondition = true
    res.render('conditions', {navCondition})
  }
}

