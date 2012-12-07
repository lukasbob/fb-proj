var Db = require("mongodb").Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var suffix = "_response_time";

var ResponseTimeProvider = function (host, port) {
	this.db = new Db("fbproj", new Server(host, port, { auto_reconnect: true }, {}), { safe: true });
	this.db.open(function () {});
};

ResponseTimeProvider.prototype.getCollection = function (name, fn) {
	this.db.collection(name + suffix, function (err, coll) {
		if (err) { fn(err); }
		else { fn(null, coll); }
	});
};

ResponseTimeProvider.prototype.telenor = function(fn) {
	this.db.collection("telenor_response_time", function(err, coll){
		coll.find({}).toArray(function(err, data){
			fn(null, data);
		});
	});
};

ResponseTimeProvider.prototype.findAll = function (name, fn) {
	this.getCollection(name, function (err, coll) {
		if (err) { fn(err); }
		else {
			var cursor = coll.find({}).sort({ "value.postDate": 1 }).toArray(function (err, res) {
					if (err) { fn(err); }
					else {
						fn(null, res);
					}
			});
		}
	});
};

exports.ResponseTimeProvider = ResponseTimeProvider;
