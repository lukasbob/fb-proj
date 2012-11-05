/**
 * Event handlers
 */
var commentClick = function (e) {
	$(this).addClass("boo");
	$.post("/comment/" + this.id, { like: true }, function(res){

		console.log(res);
	});
};

var rankingSubmit = function(e) {
	e.preventDefault();
	var form = $(this).parents("form");
	$.post(form.attr("action"), form.serialize(), function(res){
		console.log(res);
	});
};

/**
 * Event declaration
 * @type {Object}
 */
var events = {
	".comment click": commentClick,
	".ranking click": rankingSubmit
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
