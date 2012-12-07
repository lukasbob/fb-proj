/*global emit*/
var Db = require("mongodb").Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var host = "127.0.0.1";
var port = 27017;

var db = new Db("fbproj", new Server(host, port, { auto_reconnect: true }, {}), { safe: true });

var collectionName = "tdc";

// Establish connection to db
db.open(function (err, db) {
	db.collection(collectionName, function (err, collection) {
		var map = function () {

				var parseDate = function (date) {
					var output = {
						year: date.substr(0, 4),
						month: date.substr(5, 2),
						date: date.substr(8, 2),
						hours: date.substr(11, 2),
						minutes: date.substr(14, 2),
						seconds: date.substr(17, 2)
					};
					return output; //new Date(output.year, output.month - 1, output.date, output.hours, output.minutes, output.seconds);
				};

				var date = parseDate(this.created_time);

				var key = {
					category: this.category
					// year: date.year,
					// month: date.month,
					// day: date.date
				};

				var value = { count: 1 };
				emit(key, value);
			};

		var reduce = function (key, values) {
				var sum = 0;
				values.forEach(function (v) {
					sum += v.count;
				});

				return { count: sum };
			};

		collection.mapReduce(map, reduce, {
			out: { replace: collectionName + "_post_category" }
		}, function (err, coll) { db.close(); });
	});
});
