// Load data from one of the data files.

var _ = require("underscore");
var data = require("./data/telenor_20120802-20120803").feed.data;

var postCounter = 1;
var PostProvider = function () {};

PostProvider.prototype.dummyData = [];

PostProvider.prototype.findAll = function (fn) {
	fn(null, this.dummyData);
};
PostProvider.prototype.findById = function(id, fn) {
	var post = _.find(this.dummyData, function(post) { return post.id === id; });
	fn(post);
};

PostProvider.prototype.save = function (posts, fn) {

	var post = null;
	if (typeof (posts.length) === "undefined") {
		posts = [posts];
	}

	for (var i = 0; i < posts.length; i++) {
		post = posts[i];
		post._id = postCounter++;
		post.created_at = new Date();

		if (post.comments === undefined) {
			post.comments = [];
		}
		for (var j = 0; j < post.comments.length; j++) {
			post.comments[j].created_at = new Date();
		}

		this.dummyData[this.dummyData.length] = post;
	}

	fn(null, posts);
};

new PostProvider().save(data, function(error, posts) {});

exports.PostProvider = PostProvider;
