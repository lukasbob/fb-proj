var PostProvider = require("./../back/persistence/PostProvider").PostProvider;

/*
 * GET home page.
 */

var postProvider = new PostProvider("localhost", 27017);
var limit = 1;
exports.index = function (req, res) {
	var page = parseInt((req.params.page || 0), 10);
	var skip = page * limit;
	postProvider.findAll(limit, skip, function (error, posts, count) {
		res.render('index', {
			title: 'Telenor (side ' + page + ')',
			posts: posts,
			limit: limit,
			skip: skip,
			total: count,
			page: page
		});
	});
};

/**
 * POST comment
 */
exports.comment = function(req, res) {
	var commentId = req.params.cid;
	var preferred = req.param("preferred") === "true";
	var postId = commentId.split("_").slice(0, 2).join("_");
	postProvider.togglePreferredComment(commentId, preferred, function(err, post) {
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
		res.send(200);
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
