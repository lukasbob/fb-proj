var https = require("https");
var fs = require('fs');
var auth = require("./auth");
var PostProvider = require("../persistence/PostProvider").PostProvider;

var postProvider = new PostProvider("173.203.105.5", 27017, "tdc");

function pad(number) { return (number < 10 ? '0' : '') + number; }
function unixTs(date) { return Math.round(date.getTime() / 1000); }
function fileTs(date) { return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join(""); }

function getComment(token, id) {
	var options = {
		host: "graph.facebook.com",
		path: "/" + id + "/comments?access_token=" + token,
		port: 443
	};
	var response = "";
	https.get(options, function (resp) {
		resp.on("data", function(d){
			response += d;
		});

		resp.on("end", function(){
			var comments = JSON.parse(response);
			postProvider.updateComments(id, comments.data, function(){
				console.log("Updated comments for " + id);
			});
		});
	});
}

function makeRequest(token) {

	var startdate = new Date(2012, 9, 1, 0, 0, 0, 0);
	var enddate = new Date(2012, 9, 31, 0, 0, 0, 0);
	//enddate.setDate(startdate.getDate() + 30);

	var pages = [/*{
		name: "telenor",
		id: 224393774239629
	}*/{
		name: "tdc",
		id: 122386617773431
	}];

	var query = "feed.fields(message,from.name,comments)" + ".since(" + unixTs(startdate) + ")" + ".until(" + unixTs(enddate) + ")" + ".limit(1000)";

	console.log("startdate: " + startdate);
	console.log("enddate: " + enddate);
	console.log("query: " + query);

	pages.forEach(function (page, i) {
		var fileName = page.name + "_" + fileTs(startdate) + "-" + fileTs(enddate) + ".json";
		var options = {
			host: "graph.facebook.com",
			path: "/" + page.id + "?access_token=" + token + "&fields=" + query,
			port: 443
		};

		var response = "";
		var commentUpdatesNeeded = [];
		console.log("Getting data for " + page.name + "...");
		https.get(options, function (resp) {
			resp.on("data", function (d) {
				process.stdout.write(".");
				response += d;
			});

			resp.on("end", function () {
				console.log("\nSaving to " + fileName + "...");
				var output = JSON.parse(response);

				output.feed.data.forEach(function(post, i){
					if (post.comments.count > 0 && post.comments.data && post.comments.data.length !== post.comments.count) {
						commentUpdatesNeeded.push(post.id);
					}
				});

				console.log("Needs comments update: " + commentUpdatesNeeded.length);

				commentUpdatesNeeded.forEach(function (id, i) {
					getComment(token, id);
					if (i === commentUpdatesNeeded.length - 1) {
						console.log("done updating comments.");
					}
				});

				postProvider.save(output.feed.data, function(err, res){
					console.log(res.length);
					postProvider.db.close();
					console.log("Done!");
				});

			});
		});
	});
}

auth.obtainToken(makeRequest);
