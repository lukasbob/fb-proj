var https = require("https");
var fs = require('fs');
var auth = require("./auth");
var config = require("./../../config");
var PostProvider = require("../persistence/PostProvider").PostProvider;

var postProvider = new PostProvider(config.mongo.host, config.mongo.port);

function unixTs(date) { return Math.round(date.getTime() / 1000); }

function getComment(name, token, id) {
	var response = "";

	var options = {
		host: "graph.facebook.com",
		path: "/" + id + "/comments?access_token=" + token,
		port: 443
	};

	https.get(options, function (resp) {
		resp.on("data", function(d){
			response += d;
		});

		resp.on("end", function(){
			var comments = JSON.parse(response);
			postProvider.updateComments(name, id, comments.data, function(){
				console.log("Updated comments for " + id);
			});
		});
	});
}


function makeRequest(token) {
	var commentUpdatesNeeded = { "telenor": [], "tdc": [] };

	// Telenor
	// var incidentdate = new Date(2012, 7, 2, 0, 0, 0, 0);
	// var startdate = new Date(2012, 6, 16, 0,0,0,0);
	// var workingEnddate = new Date(2012, 6, 16, 0,0,0,0);
	// var workingStartdate = new Date(2012, 6, 15, 0,0,0,0);
	// var enddate = new Date(2012, 7, 17, 0,0,0,0);

	// TDC
	var incidentdate = new Date(2012, 9, 13, 0, 0, 0, 0);
	var startdate = new Date(2012, 8, 29, 0,0,0,0);
	var workingEnddate = new Date(2012, 8, 29, 0,0,0,0);
	var workingStartdate = new Date(2012, 8, 28, 0,0,0,0);
	var enddate = new Date(2012, 9, 28, 0,0,0,0);

	console.log(startdate);
	console.log(enddate);

	var pages = [/*{
		name: "telenor",
		id: 224393774239629
	}, */{
		name: "tdc",
		id: 122386617773431
	}];

	function getPosts() {
		if (workingEnddate > enddate) {
			commentUpdatesNeeded.telenor.forEach(function (id, i) {
				getComment("telenor", token, id);
			});
			commentUpdatesNeeded.tdc.forEach(function (id, i) {
				getComment("tdc", token, id);
			});
			return;
		}

		workingStartdate.setDate(workingStartdate.getDate() + 1);
		workingEnddate.setDate(workingEnddate.getDate() + 1);

		console.log(workingStartdate);
		console.log(workingEnddate);

		var query = "feed.fields(message,from.name,comments)"
		          + ".since(" + unixTs(workingStartdate) + ")"
		          + ".until(" + unixTs(workingEnddate) + ")"
		          + ".limit(1000)";

		pages.forEach(function (page, i) {
			var options = {
				host: "graph.facebook.com",
				path: "/" + page.id + "?access_token=" + token + "&fields=" + query,
				port: 443
			};

			console.log("Getting data for " + page.name + "...");
			https.get(options, function (resp) {
				var response = "";
				resp.on("data", function (d) {
					process.stdout.write(".");
					response += d;
				});

				resp.on("end", function () {
					var output = JSON.parse(response);

					output.feed.data.forEach(function(post, i){
						if (post.comments.count > 0 && post.comments.data && post.comments.data.length !== post.comments.count) {
							commentUpdatesNeeded[page.name].push(post.id);
						}
					});

					console.log("Needs comments update: " + commentUpdatesNeeded[page.name].length);



					postProvider.save(page.name, output.feed.data, function(err, res){
						console.log(res.length + " posts saved.");
						postProvider.db.close();
						console.log("Done!");
						getPosts();
					});

				});
			});
		});
	}
	getPosts();
}

auth.obtainToken(makeRequest);
