/*global emit*/
var Db = require("mongodb").Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var host = "127.0.0.1";
var port = 27017;

var db = new Db("fbproj", new Server(host, port, {
	auto_reconnect: true
}, {}), {
	safe: true
});
var collectionName = "telenor";

// Establish connection to db
db.open(function (err, db) {
	db.collection(collectionName, function (err, collection) {

		var map = function () {
				var tdcId = "122386617773431";
				var telenorId = "224393774239629";
				var companyId = telenorId;
				var parseDate = function (date) {
						var output = {
							year: date.substr(0, 4),
							month: date.substr(5, 2),
							date: date.substr(8, 2),
							hours: date.substr(11, 2),
							minutes: date.substr(14, 2),
							seconds: date.substr(17, 2)
						};
						return new Date(output.year, output.month - 1, output.date, output.hours, output.minutes, output.seconds);
					};
				var key = this._id;
				var values = {
					id: this.id,
					postDate: parseDate(this.created_time),
					commentCount: this.comments.data ? this.comments.data.length : 0
				};

				if (this.comments.data) {
					for (var i = 0; i < this.comments.data.length; i++) {
						if (this.comments.data[i].from.id.toString() === companyId) {
							values.commentDate = parseDate(this.comments.data[i].created_time);
							values.responseTime = values.commentDate - values.postDate;
							break;
						}
					}
				}

				emit(key, values);
			};

		var reduce = function (key, values) {
				var sum = 0;
				values.forEach(function (v) {
					sum += v.commentCount;
				});

				return {
					count: sum
				};
			};

		collection.mapReduce(map, reduce, {
			out: {
				replace: collectionName + "_response_time"
			}
		}, function (err, coll) {
			console.log(err);
			db.close();
		});
	});
});
