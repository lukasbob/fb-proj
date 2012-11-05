/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(require('less-middleware')({ src: __dirname + '/public' }));
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
	app.use(express.errorHandler());
});

/**
 * Helpers
 */
app.locals.nlFilter = function (txt) {
	if (!txt) { return txt; }
	var rx = new RegExp("\n", "g");
	return txt ? txt.replace(rx, "<br>") : txt;
};
app.locals.date = function(txt) {
	return new Date(txt).toLocaleString();
};


/**
 * Routes
 */
app.get('/', routes.index);
app.post('/comment/:cid', routes.comment);
app.get('/posts/:pid', routes.posts);
app.post('/post/:pid', routes.updatePost);
/**
 * Setup server
 */
http.createServer(app).listen(app.get('port'), function () {
	console.log("Express server listening on port " + app.get('port'));
});
