var https = require("https");
var fs = require('fs');
var config = require("./config");

/**
 * Logs into facebook as the app with the credentials provided in config.
 * @param  {Function} fn Callback function. the Facebook access_token is passed.
 */
exports.obtainToken = function(fn) {
	if (!config || !config.login || !config.secret) {
		console.log("Missing config file containing Facebook credentials.");
		return;
	}

	console.log("Obtaining access token from Facebook using app ID " + config.login);
	var req = {
		host: "graph.facebook.com",
		path: "/oauth/access_token?client_id=" + config.login + "&client_secret=" + config.secret + "&grant_type=client_credentials",
		port: 443
	};

	var data = "";
	https.get(req, function(resp) {
		resp.on("data", function (d) { data += d; });

		resp.on("end", function () {
			console.log(data);
			console.log("Access token retrieved!");
			fn(data.split("access_token=")[1]);
		});
	});
};
