var Db = require("mongodb").Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var PostProvider = function (host, port) {
		this.db = new Db("fbproj", new Server(host, port, { auto_reconnect: true }, {}), { safe: true });
		this.db.open(function () {});
	};

PostProvider.prototype.getCollection = function(fn) {
	this.db.collection("telenor", function(err, coll) {
		if (err) { fn(err); }
		else { fn(null, coll); }
	});
};

PostProvider.prototype.findAll = function (fn) {
	this.getCollection(function (err, coll) {
		if (err) { fn(err); }
		else {
			coll.find().sort({ "created_time": 1 }).toArray(function(err, res){
				if (err) { fn(err); }
				else {fn (null, res); }
			});
		}
	});
};

PostProvider.prototype.updateComments = function(id, comments, fn) {
	this.getCollection(function(err, coll){
		if (err) { fn(err); }
		else {
			coll.update({ id: id }, { $set: { "comments.data": comments }}, fn);
		}
	});
};

PostProvider.prototype.setCategoryAndRating = function (id, category, rating, fn) {
	this.getCollection(function (err, coll) {
		if (err) { fn(err); }
		else {
			coll.update({ id: id }, { $set: { category: category, rating: rating}}, fn);
		}
	});
};

PostProvider.prototype.setPreferredComment = function(id, fn) {
	var that = this;
	var postId = id.split("_").slice(0, 2).join("_");
	this.getCollection(function(err, coll){
		if (err) { fn(err); }
		else {
			that.findById(postId, function(err, post){
				var comments = post.comments.data.map(function(c, i){
					if (c.id === id) { c.preferred = true; }
					return c;
				});
				coll.update({ id: postId }, {$set: {"comments.data": comments}}, fn);
			});

		}
	});
};

PostProvider.prototype.findById = function(id, fn){
	this.getCollection(function(err, coll){
		if (err) { fn(err); }
		else {
			coll.findOne({id: id}, fn);
		}
	});
};

PostProvider.prototype.save = function (posts, fn) {
	this.getCollection(function(err, coll) {
		coll.insert(posts, function(err, result){
			if (err) { console.error("insertion error: " + err); }
			else { fn(null, result); }
		});
	});
};

exports.PostProvider = PostProvider;
