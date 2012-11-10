/**
 * Event handlers
 */
var commentClick = function (e) {
	var preferredClass = "preferred";
	var isPreferred = $(this).hasClass(preferredClass);
	if (isPreferred) {
		$(this).removeClass(preferredClass);
	} else {
		$(this).addClass(preferredClass);
	}
	$.post(base + "/comment/" + this.id, { "preferred": !isPreferred }, function(res){
		console.log(res);
	});
};

var rankingSubmit = function(e) {
	e.preventDefault();
	var form = $(this).parents("form");
	form.addClass("submitting");

	$.ajax({
		type: 'POST',
		url: form.attr("action"),
		data: form.serialize(),
		success: function(res){
			form.removeClass("submitting").addClass("saved");
			$(".next").focus();
		},
		error: function(){
			console.log("error");
		}
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

$(window).on("keyup", function(e){
	switch(e.keyCode) {
		case 39: $('.next').trigger("click"); break;
		case 37: $('.prev').trigger("click"); break;
	}
});

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
