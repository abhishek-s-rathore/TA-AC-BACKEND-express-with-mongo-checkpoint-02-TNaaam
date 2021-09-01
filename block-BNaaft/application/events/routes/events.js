var express = require('express');
var router = express.Router();
var { format } = require('date-fns');
var multer = require('multer');
var path = require('path');

var Event = require('../models/event');
var Remark = require('../models/remark');

// Using Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../', 'public/', 'uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Handling Filters
router.get('/filter/', (req, res, next) => {
  const { location, category } = req.query;

  let arr = [];
  var allCategories = [];
  var allLocations = [];

  Event.distinct('categories', (err, elem) => {
    if (err) return next(err);
    allCategories.push(elem);
  });
  Event.distinct('location', (err, elem) => {
    if (err) return next(err);
    allLocations.push(elem);
  });

  if (location) {
    Event.find({}, (err, events) => {
      if (err) return next(err);
      for (let i = 0; i < events.length; i++) {
        console.log(events[i].location, location);
        if (events[i].location === location) {
          arr.push(events[i]);
        }
      }
      console.log(events);
      res.render('new', {
        events: arr,
        categoriesArr: allCategories[0],
        locationArr: allLocations[0],
      });
    });
  } else {
    Event.find({}, (err, events) => {
      if (err) return next(err);
      for (let i = 0; i < events.length; i++) {
        if (events[i].categories.includes(category)) {
          arr.push(events[i]);
        }
      }
      console.log(arr);
      res.render('new', {
        events: arr,
        categoriesArr: allCategories[0],
        locationArr: allLocations[0],
      });
    });
  }
});

// SortByDate

router.post('/sortbydate', (req, res, next) => {
  let arr = [];
  var allCategories = [];
  var allLocations = [];

  Event.distinct('categories', (err, elem) => {
    if (err) return next(err);
    allCategories.push(elem);
  });

  Event.distinct('location', (err, elem) => {
    if (err) return next(err);
    allLocations.push(elem);
  });

  Event.find(
    { start_date: { $gte: req.body.firstdate, $lt: req.body.lastdate } },
    (err, events) => {
      if (err) return next(err);
      res.render('new', {
        events: events,
        categoriesArr: allCategories[0],
        locationArr: allLocations[0],
      });
    }
  );
});

// Routes
router.get('/', (req, res, next) => {
  var allCategories = [];
  var allLocations = [];
  Event.distinct('categories', (err, elem) => {
    if (err) return next(err);
    allCategories.push(elem);
  });
  Event.distinct('location', (err, elem) => {
    if (err) return next(err);
    allLocations.push(elem);
  });
  Event.find({}, (err, events) => {
    if (err) return next(err);
    res.render('events', {
      events: events,
      categoriesArr: allCategories[0],
      locationArr: allLocations[0],
    });
  });
});

router.get('/new', (req, res, next) => {
  res.render('newEvent');
});

router.post('/', upload.single('cover'), (req, res, next) => {
  var data = req.body;
  data.cover = req.file.filename;
  data.categories = data.categories.trim().split(',');
  Event.create(data, (err, event) => {
    if (err) return next(err);
    res.redirect('/events');
  });
});

router.get('/:eventId', (req, res, next) => {
  var eventId = req.params.eventId;
  Event.findById(eventId)
    .populate('remarks')
    .exec((err, event) => {
      let startDate = format(event.start_date, 'dd/MM/yyyy');
      let endDate = format(event.end_date, 'dd/MM/yyyy');
      if (err) return next(err);
      res.render('eventDetails', { event, startDate, endDate });
    });
});

router.get('/:eventId/edit', (req, res, next) => {
  var eventId = req.params.eventId;
  Event.findById(eventId, (err, event) => {
    if (err) return next(err);
    res.render('editEvent', { event });
  });
});

router.post('/:eventId', upload.single('cover'), (req, res, next) => {
  var eventId = req.params.eventId;
  data.cover = req.file.filename;
  var data = req.body;
  Event.findByIdAndUpdate(eventId, data, (err, updatedEvent) => {
    if (err) return next(err);
    res.redirect('/events/' + eventId);
  });
});

router.get('/:eventId/delete', (req, res, next) => {
  var eventId = req.params.eventId;
  Event.findByIdAndRemove(eventId, (err, event) => {
    if (err) return next(err);
    Remark.deleteMany({ eventId: event._id }, (err, info) => {
      res.redirect('/events');
    });
  });
});

router.get('/:eventId/likes', (req, res, next) => {
  var eventId = req.params.eventId;
  Event.findByIdAndUpdate(eventId, { $inc: { likes: 1 } }, (err, event) => {
    if (err) return next(err);
    res.redirect('/events/' + eventId);
  });
});

router.get('/:eventId/dislikes', (req, res, next) => {
  var eventId = req.params.eventId;
  Event.findByIdAndUpdate(eventId, { $inc: { dislikes: 1 } }, (err, event) => {
    if (err) return next(err);
    res.redirect('/events/' + eventId);
  });
});

// Comments
router.post('/:eventId/remarks', (req, res, next) => {
  var eventId = req.params.eventId;
  var data = req.body;
  data.eventId = eventId;
  Remark.create(data, (err, remark) => {
    if (err) return next(err);
    Event.findByIdAndUpdate(
      eventId,
      { $push: { remarks: remark._id } },
      (err, event) => {
        res.redirect('/events/' + eventId);
      }
    );
  });
});

module.exports = router;
