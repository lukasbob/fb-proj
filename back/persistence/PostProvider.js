var Db = require("mongodb").Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var PostProvider = function(host, port) {
	this.db= new Db('fbproj', new Server(host, port, {auto_reconnect: true}, {}));
	this.db.open(function(){});
};

exports.PostProvider = PostProvider;
