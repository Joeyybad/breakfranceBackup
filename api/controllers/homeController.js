const Event = require("../models/eventModel")
const Comment = require("../models/commentModel")
const { Op } = require('sequelize')


module.exports = {
  get: async (req, res) => {
    console.log(req.session);
    const navHome = true
    const events = await Event.findAll({
      raw: true,
      limit: 1,
      order: [['createdAt', 'DESC']]
    })
    res.render('home', { events, navHome })
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
    res.render('home', { eventCount, eventResults})
  },

  faq: async (req, res) => {
    const navFaq = true
    res.render('faq', { navFaq })
  }
}

