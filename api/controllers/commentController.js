const Comment = require("../models/commentModel");
const { validationResult } = require('express-validator');

module.exports = {
    get: async (req, res) => {
        res.render('event_read', { eventId: req.params.eventId });
    },

    post: async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            const errors = result.array();
            return res.render('event_read', { errors, eventId: req.params.eventId });
        } else {
            await Comment.create({
                name: req.body.name.trim(),
                comment: req.body.comment.trim(),
                eventId: req.params.eventId
            });
            res.redirect('back');
        }
    },

    postcommentUpdate: async (req, res) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            const errors = result.array();
            return res.render('event_read', { errors, eventId: req.params.eventId });
        } else {
            await Comment.update({
                name: req.body.name.trim(),
                comment: req.body.comment.trim()
            }, {
                where: {
                    id: req.params.id
                }
            });
            res.redirect('back');
        }
    },

    deleteComment: async (req, res) => {
        await Comment.destroy({ where: { id: req.params.commentId } });
        res.redirect('back');
    },

    getCommentsByEvent: async (req, res) => {
        const comments = await Comment.findAll({
            where: { eventId: req.params.eventId },
            raw: true
        });
        res.render('event_read', { comments, eventId: req.params.eventId });
    }
};