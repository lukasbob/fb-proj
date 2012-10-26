/*global d3: false, _:false*/

// Container
var div = d3.select("body").append("div");

window.comments = 0;

function updateNode(s){
	s.attr("id", function(d, i){ return "post_" + d.id; }).attr("class", "post");
	s.append("small").attr("class", "date").text(function(d, i){ return new Date(d.created_time).toLocaleString(); });
	s.append("p").text(function(d, i){ return d.message; });
	s.append("p").attr("class", "author").text(function(d){ return d.from.name; });
	s.append("p").attr("class", "comments").text(function (d) { window.comments += d.comments.count; return d.comments.count + " comments"; });
}

d3.json("../data/telenor_20120801-20120804.json", function(data){

	var p = div.selectAll("div").data(data.feed.data).call(updateNode);
	p.enter().append("div").call(updateNode);

});