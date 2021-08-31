// Requiring Packages
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const multer = require('multer');
const mongoose = require('mongoose');

// Requiring Routes
const indexRouter = require('./routes/index');
const eventsRouter = require('./routes/events');
const remarksRouter = require('./routes/remarks');

// Connecting To Database
mongoose.connect(
  'mongodb://localhost/events',
  { useNewUrlParser: true, useUnifiedTopology: true },
  (error) => {
    console.log(`Connected to database: `, error ? false : true);
  }
);

// Instantiating Application
const app = express();

// view Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Using Midddlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: false, // true = .sass and false = .scss
    sourceMap: true,
  })
);
app.use(express.static(path.join(__dirname, 'public')));

// Using Routes
app.use('/', indexRouter);
app.use('/events', eventsRouter);
app.use('/remarks', remarksRouter);

// Catch 404 And Forward to Error Handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error Handler
app.use(function (err, req, res, next) {
  // Set Locals, Only Providing Error In Development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // RendeR error Page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
