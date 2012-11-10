var config = require("./../config");
var PostProvider = require("./../back/persistence/PostProvider").PostProvider;

/*
 * GET home page.
 */

var limit = 1;
var postProvider = new PostProvider(config.mongo.host, config.mongo.port);

exports.index = function(req, res) {
	res.render("index", {
		title: "Vælg et firma"
	});
};

exports.list = function (req, res) {
	var page = parseInt((req.params.page || 0), 10);
	var skip = page * limit;
	postProvider.findAll(req.params.name, limit, skip, function (error, posts, count) {
		res.render('list', {
			title: req.params.name + ' (side ' + (page+1) + ')',
			posts: posts,
			base: "/c/" + req.params.name,
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
	postProvider.togglePreferredComment(req.params.name, commentId, preferred, function(err, post) {
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
	postProvider.setCategoryAndRating(req.params.name, req.params.pid, cat, tone, function(err, post){
		res.send(200);
	});
};

/**
 * GET post
 */
exports.posts = function (req, res) {
	postProvider.findById(req.params.name, req.params.pid, function(err, post){
		res.send(post);
	});
};
