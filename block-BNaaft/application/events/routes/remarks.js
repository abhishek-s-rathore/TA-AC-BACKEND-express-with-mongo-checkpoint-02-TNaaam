var express = require('express');
var router = express.Router();

var Event = require('../models/event');
var Remark = require('../models/remark');

router.get('/:remarkId/edit', (req, res, next) => {
  var remarkId = req.params.remarkId;
  Remark.findById(remarkId, (err, remark) => {
    if (err) return next(err);
    res.render('editRemark', { remark });
  });
});

router.post('/:remarkId', (req, res, next) => {
  var remarkId = req.params.remarkId;
  var data = req.body;
  Remark.findByIdAndUpdate(remarkId, data, (err, updatedRemark) => {
    console.log(err, updatedRemark);
    if (err) return next(err);
    res.redirect('/events/' + updatedRemark.eventId);
  });
});

router.get('/:remarkId/delete', (req, res, next) => {
  var remarkId = req.params.remarkId;
  Remark.findByIdAndRemove(remarkId, (err, remark) => {
    if (err) return next(err);
    Event.findByIdAndUpdate(
      remark.eventId,
      { $pull: { remarks: remark._id } },
      (err, event) => {
        if (err) return next(err);
        res.redirect('/events/' + remark.eventId);
      }
    );
  });
});

router.get('/:remarkId/likes', (req, res, next) => {
  var remarkId = req.params.remarkId;
  Remark.findByIdAndUpdate(remarkId, { $inc: { likes: 1 } }, (err, remark) => {
    if (err) return next(err);
    res.redirect('/events/' + remark.eventId);
  });
});

router.get('/:remarkId/dislikes', (req, res, next) => {
  var remarkId = req.params.remarkId;
  Remark.findByIdAndUpdate(
    remarkId,
    { $inc: { dislikes: 1 } },
    (err, remark) => {
      if (err) return next(err);
      res.redirect('/events/' + remark.eventId);
    }
  );
});

module.exports = router;
