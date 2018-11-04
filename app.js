var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// mongodb connection
const mongoose = require('mongoose');
const conf = require('./config/config');
const {mongodb: {type, host, port, name}} = conf;
const url = `${type}://${host}:${port}/${name}`;
mongoose.connect(url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

var app = express();
var debug = require('debug')('moana:server');

var bodyParser = require('body-parser');
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routers
require('./routes/initdata.route')(app, '/initdata');
// require('./routes/transaction.route')(app, '/');
require('./routes/transaction.route')(app, '/');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// node app.js start the server, change package.json as well
// module.exports = app;
app.set('port', process.env.PORT || conf.server.port);
var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
// one second = 1000
server.timeout = 10 * 1000;