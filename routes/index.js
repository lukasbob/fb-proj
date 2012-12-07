var config = require("./../config");
var PostProvider = require("./../back/persistence/PostProvider").PostProvider;
var ResponseTimeProvider = require("./../back/persistence/ResponseTimeProvider").ResponseTimeProvider;

/*
 * GET home page.
 */

var limit = 1;
var postProvider = new PostProvider(config.mongo.host, config.mongo.port);
// var responseTimeProvider = new ResponseTimeProvider(config.mongo.host, config.mongo.port);
var responseTimeProvider = new ResponseTimeProvider("127.0.0.1", 27017);

exports.index = function (req, res) {
	res.render("index", {
		title: "Vælg et firma"
	});
};

exports.list = function (req, res) {
	var page = parseInt((req.params.page || 0), 10);
	var skip = page * limit;
	postProvider.findAll(req.params.name, limit, skip, function (error, posts, count) {
		res.render('list', {
			title: req.params.name + ' (side ' + (page + 1) + ')',
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
exports.comment = function (req, res) {
	var commentId = req.params.cid;
	var preferred = req.param("preferred") === "true";
	var postId = commentId.split("_").slice(0, 2).join("_");
	postProvider.togglePreferredComment(req.params.name, commentId, preferred, function (err, post) {
		res.send(post);
	});
};

/**
 * POST post rating & category
 */
exports.updatePost = function (req, res) {
	var params = {
		category: req.param("category"),
		tone: req.param("tone"),
		replyCount: req.param("replyCount"),
		companyResponse: req.param("companyResponse"),
		companyTone: req.param("companyTone"),
		solution: req.param("solution"),
	};

	postProvider.updatePost(req.params.name, req.params.pid, params, function (err, post) {
		res.send(200);
	});
};

/**
 * GET post
 */
exports.posts = function (req, res) {
	postProvider.findById(req.params.name, req.params.pid, function (err, post) {
		res.send(post);
	});
};

exports.test = function (req, res) {
	var page = parseInt((req.params.page || 0), 10);
	var skip = page * limit;
	postProvider.findAllTest(req.params.name, limit, skip, function (err, posts) {
		res.send(posts);
	});
};

exports.response = function(req, res) {
	responseTimeProvider.findAll(req.params.name, function(err, posts) {
		res.render("responsetime", {
			title: "Response time",
			data: posts.map(function(d){ return { date: d.value.postDate, responseTime: d.value.responseTime }; })
		});
	});
};
