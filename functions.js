// widths and heights for our plots - you should use these in constructing scales
var width = 1000, height = 1000;
var pad = 25;
var lines_width = lines_width - (pad + pad), lines_height = lines_height - 2 * pad;
var data = null;

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "CoreTrends2018.csv",
        dataType: "text",
        success: function(data) {processData(data);}
     });
});


// Each array contains the full set of data where the 
// values for the specified field are all valid
var processData = (csv) => {
	data = $.csv.toObjects(csv);
	var twitter = filterTwitter(data);
	console.log("twitter data");
	console.log(twitter);
	var insta = filterInsta(data);
	console.log("insta data");
	console.log(insta);
	var fb = filterFb(data);
	console.log("fb data");
	console.log(fb);
	var snap = filterSnap(data);
	console.log("snap data");
	console.log(snap);
	var yt = filterYt(data);
	console.log("Yt data");
	console.log(yt);
	var intmob = filterIntmob(data);
	console.log("intmob data");
	console.log(intmob);
	var books = filterBooks(data);
	console.log("books data");
	console.log(books);
};

var filterTwitter = (data) => {
	return data.filter(data => parseInt(data.sns2a) >= 1 && parseInt(data.sns2a) <= 5);
}

var filterInsta = (data) => {
	return data.filter(data => parseInt(data.sns2b) >= 1 && parseInt(data.sns2b) <= 5);
}

var filterFb = (data) => {
	return data.filter(data => parseInt(data.sns2c) >= 1 && parseInt(data.sns2c) <= 5);
}

var filterSnap = (data) => {
	return data.filter(data => parseInt(data.sns2d) >= 1 && parseInt(data.sns2d) <= 5);
}

var filterYt = (data) => {
	return data.filter(data => parseInt(data.sns2e) >= 1 && parseInt(data.sns2e) <= 5);
}

var filterIntmob = (data) => {
	return data.filter(data => parseInt(data.intmob) < 8);
}

var filterBooks = (data) => {
	return data.filter(data => parseInt(data.books1) < 98);
}

//Create SVG elements and perform transforms to prepare for visualization
function setup_plots() {
	d3.select('body').append('svg').attr('width', 1000).attr('height', 1000).attr('transform', 'translate(5,5)')
	// group that will contain line plot (id: lines)
	d3.select('svg').append('g').attr('transform', 'translate(' + pad + ',' + pad + ')').attr('id', 'lines')
	// group that will contain heatmap (id: hm)
	d3.select('svg').append('g').attr('transform', 'translate(' + pad + ',' + (20 + pad + height) + ')').attr('id', 'hm')

}

function populate_dropdown() {
	d3.select('body').append('div').text('Select a question!')	
	d3.select('body').append('div').append('select').selectAll('questions').data(questions).enter().append('option')
		.text(d => { console.log(d); return d.question }).attr('value', (d, i) => i);
	// d3.select('select')
	// 	.on('change', function (d, i) {
	// 		var datum = d3.select(this).property('value');
	// 		sentence = lstm_data[datum].sentence;
	// 		lstm_states = lstm_data[datum].lstm;
	// 		setup_vis(); // this is what you will implement - called each time a new sentence is chosen
	// 	})
}

function plot_it() {

	populate_dropdown();
	setup_plots();

}
