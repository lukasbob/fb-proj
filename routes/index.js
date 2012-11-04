var PostProvider = require("./../back/persistence/post-provider-memory").PostProvider;

/*
 * GET home page.
 */

var postProvider = new PostProvider();

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
	res.send(req.params.cid);
};
