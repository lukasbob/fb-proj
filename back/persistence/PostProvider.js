var Db = require("mongodb").Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var PostProvider = function (host, port) {
	this.db = new Db("fbproj", new Server(host, port, { auto_reconnect: true }, {}), { safe: true });
	this.db.open(function () {});
};

PostProvider.prototype.getCollection = function (name, fn) {
	this.db.collection(name, function (err, coll) {
		if (err) {
			fn(err);
		} else {
			fn(null, coll);
		}
	});
};

PostProvider.prototype.findAll = function (name, limit, skip, fn) {
	this.getCollection(name, function (err, coll) {
		if (err) { fn(err); }
		else {
			var options = {
				"limit": limit ? limit : 10,
				"skip": skip ? skip : 0
			};
			var cursor = coll.find({}, options);
			cursor.count(function(err, totalPosts){
				cursor.sort({ "created_time": 1 }).toArray(function (err, res) {
						if (err) { fn(err); }
						else {
							fn(null, res, totalPosts);
						}
					});
			});
		}
	});
};

PostProvider.prototype.findAllTest = function(name, limit, skip, fn){
	this.getCollection(name, function(err, coll) {
		if (err) { fn(err); return; }
		var options = {};
		var cursor = coll.find({ "companyResponse": /taler/i }, options);
		cursor.count(function(err, totalPosts){
			cursor.sort({ "created_time": 1 }).toArray(function (err, res) {
				if (err) { fn(err); }
				else {
					fn(null, res, totalPosts);
				}
			});
		});
	});
};

PostProvider.prototype.updateComments = function (name, id, comments, fn) {
	this.getCollection(name, function (err, coll) {
		if (err) {
			fn(err);
		} else {
			coll.update({ id: id }, { $set: { "comments.data": comments } }, fn);
		}
	});
};

PostProvider.prototype.updatePost = function (name, id, params, fn) {
	params.saved = true;
	this.getCollection(name, function (err, coll) {
		if (err) {
			fn(err);
		} else {
			coll.update({ id: id }, { $set: params }, fn);
		}
	});
};

PostProvider.prototype.togglePreferredComment = function (name, id, isPreferred, fn) {
	var that = this;
	var postId = id.split("_").slice(0, 2).join("_");
	this.getCollection(name, function (err, coll) {
		if (err) {
			fn(err);
		} else {
			that.findById(name, postId, function (err, post) {
				var comments = post.comments.data.map(function (c, i) {
					if (c.id === id) {
						c.preferred = isPreferred;
					}
					return c;
				});
				coll.update({ id: postId }, { $set: { "comments.data": comments } }, fn);
			});

		}
	});
};

PostProvider.prototype.findById = function (name, id, fn) {
	this.getCollection(name, function (err, coll) {
		if (err) {
			fn(err);
		} else {
			coll.findOne({ id: id }, fn);
		}
	});
};

PostProvider.prototype.save = function (name, posts, fn) {
	this.getCollection(name, function (err, coll) {
		coll.insert(posts, function (err, result) {
			if (err) {
				console.error("insertion error: " + err);
			} else {
				fn(null, result);
			}
		});
	});
};

exports.PostProvider = PostProvider;
