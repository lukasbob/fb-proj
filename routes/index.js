var PostProvider = require("./../back/persistence/PostProvider").PostProvider;

/*
 * GET home page.
 */

var postProvider = new PostProvider("localhost", 27017);

exports.index = function (req, res) {
	postProvider.findAll(function (error, posts) {
		res.render('index', {
			title: 'All posts',
			posts: posts
		});
	});
};

/**
 * POST comment
 */
exports.comment = function(req, res) {
	var commentId = req.params.cid;
	var postId = commentId.split("_").slice(0, 2).join("_");
	postProvider.setPreferredComment(commentId, function(err, post) {
		res.send(post);
	});
};

/**
 * POST post rating & category
 */
exports.updatePost = function(req, res) {
	var postId = req.params.pid;
	var cat = req.param("category");
	var tone = req.param("tone");
	postProvider.setCategoryAndRating(req.params.pid, cat, tone, function(err, post){
		res.send(post);
	});
};

/**
 * GET post
 */
exports.posts = function (req, res) {
	postProvider.findById(req.params.pid, function(err, post){
		res.send(post);
	});
};
