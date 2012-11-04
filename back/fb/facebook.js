var https = require("https");
var fs = require('fs');
var auth = require("./auth");

function pad(number) { return (number < 10 ? '0' : '') + number; }
function unixTs(date) { return Math.round(date.getTime() / 1000); }
function fileTs(date) { return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join(""); }

function makeRequest(token) {

	var startdate = new Date(2012, 7, 1, 0, 0, 0, 0);
	var enddate = new Date(2012, 7, 1, 0, 0, 0, 0);
	enddate.setDate(startdate.getDate() + 3);

	var pages = [{
		name: "telenor",
		id: 224393774239629
	}, {
		name: "tdc",
		id: 122386617773431
	}];

	var query = "feed.fields(message,from.name)" + ".since(" + unixTs(startdate) + ")" + ".until(" + unixTs(enddate) + ")" + ".limit(1000)";

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

		console.log("Getting data for " + page.name + "...");
		https.get(options, function (resp) {
			resp.on("data", function (d) {
				process.stdout.write(".");
				response += d;
			});

			resp.on("end", function () {
				console.log("\nSaving to " + fileName + "...");
				var output = JSON.parse(response);

				console.log(output.feed.data.length);

				fs.writeFile(fileName, JSON.stringify(output, null, "  "));
				console.log("Done!");
			});
		});
	});
}

auth.obtainToken(makeRequest);
