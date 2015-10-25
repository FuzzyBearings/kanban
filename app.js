var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var app = express();

////
// DATABASE
////
var db = monk('localhost:27017/kanban');

// interceptor / filter
app.use(function(req,res,next) {
    req.db = db;
    next();
});

////
// SETUP
////
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

////
// ROUTES
////
var webFamilyRoutes = require('./routes/w/families');
app.use('/w/families', webFamilyRoutes);

var webBoardRoutes = require('./routes/w/boards');
app.use('/w/boards', webBoardRoutes);

var webColumnRoutes = require('./routes/w/columns');
app.use('/w/columns', webColumnRoutes);

var webStoriesRoutes = require('./routes/w/stories');
app.use('/w/stories', webStoriesRoutes);

var routes = require('./routes/index');
var users = require('./routes/users');

app.use('/', routes);
app.use('/users', users);

////
// ERROR HANDLING
////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
	// development error handler - will print stacktrace
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}
else {
	// production error handler - no stacktraces leaked to user
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {}
		});
	});
}


module.exports = app;
