/**
 * Event handlers
 */
var commentClick = function (e) {
	$.post("/comment/" + this.id, { like: true }, function(res){
		console.log(res);
	});
};

/**
 * Event declaration
 * @type {Object}
 */
var events = {
	".comment click": commentClick
};

/**
 * Event delegation
 */
for (var ev in events) {
	var parts = ev.split(/\s/);
	var elms = document.querySelectorAll(parts[0]);
	for (var i = 0; i < elms.length; i++) {
		elms[i].addEventListener(parts[1], events[ev], false);
	}
}
