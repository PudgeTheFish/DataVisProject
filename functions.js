// widths and heights for our plots - you should use these in constructing scales
var width = 1000, height = 1000;
var pad = 25;
var lines_width = width / 2 - (2 * pad);
var lines_height = height / 2 - (2 * pad);
var data = null;
var data18 = null; // contains 2018 data in json object
var data19 = null; // contains 2019 data in json object


function loadJSON(callback, filename) {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', filename, false); // Replace 'appDataServices' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
}


function init() {
	 console.log("INIT");
	loadJSON(function(response) {
	 // Parsing JSON string into object
	   data18 = JSON.parse(response);
	   console.log(data18);
	}, 'data_2018.json');

	loadJSON(function(response) {
		// Parsing JSON string into object
		  data19 = JSON.parse(response);
		  console.log(data19);
	   }, 'data_2019.json');
}

init();

// Each array contains the full set of data where the 
// values for the specified field are all valid
var processData = (csv, obj) => { 
	obj = $.csv.toObjects(csv);
	//console.log(obj);
	//obj = filterTwitter(obj);
	// console.log("twitter data");
	// console.log(twitter);
	//obj['insta'] = filterInsta(obj);
	// console.log("insta data");
	// console.log(insta);
	//obj['fb'] = filterFb(obj);
	// console.log("fb data");
	// console.log(fb);
	//obj['snap'] = filterSnap(obj);
	// console.log("snap data");
	// console.log(snap);
	//obj['yt'] = filterYt(obj);
	// console.log("Yt data");
	// console.log(yt);
	//obj['intmob'] = filterIntmob(obj);
	// console.log("intmob data");
	// console.log(intmob);
	//obj['books'] = filterBooks(obj);
	// console.log("books data");
	// console.log(books);
	//console.log(obj)
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

	d3.select('svg').append('g').attr('transform', 'translate(' + pad + ',' + pad + ')').attr('id', 'plot1')
	d3.select('svg').append('g').attr('transform', 'translate(' + pad + ',' + pad + ')').attr('id', 'plot2')

	// group that will contain y axis for our line plot (id: yaxis)
	d3.select('#plot1').append('g').attr('id', 'yaxis')
	// group that will contain x axis for both our line plot and heatmap (id: xaxis)
	d3.select('#plot1').append('g').attr('id', 'xaxis')

	// group that will contain y axis for our line plot (id: yaxis)
	d3.select('#plot2').append('g').attr('id', 'yaxis')
	// group that will contain x axis for both our line plot and heatmap (id: xaxis)
	d3.select('#plot2').append('g').attr('id', 'xaxis')

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

function plot_data() {
	// console.log(data_2018);

	console.log("PLOTTING DATA");
	var data = data_2018;

	var subgroups = data.columns.slice(1);
	console.log(subgroups);
	var plot1 = d3.select('#plot1');
	var plot2 = d3.select('#plot2');

	var x_scale = d3.scaleLinear().domain([0, data_2018.books.length]).range([0, lines_width]);
	var y_scale = d3.scaleLinear().domain([0, d3.max(books, d => d.books1)]).range([lines_height - pad, 0]);
	// var salary_scale = d3.scaleLinear().domain([0, all_maxs['Salary']]).range([0, name_bar_pos]);
	plot1.selectAll('g').data(data_2018.books).enter()
		.append('circle').attr('cx', (d, i) => { return x_scale(i) })
		.attr('cy', d => y_scale(d.books1)).attr('r', 2)
		.attr('fill', '#fffff');

	plot1.select('#yaxis').call(d3.axisLeft(y_scale));
	plot1.select('#xaxis').append('text')
		.attr('transform', 'translate(' + lines_width / 2 + ',' + lines_height + ')')
		.attr('fill', '#fffff').text('2018 Respondent');

	plot2.selectAll('g').data(data_2019.books).enter()
		.append('circle').attr('cx', (d, i) => { return x_scale(i) })
		.attr('cy', d => y_scale(d.books1)).attr('r', 2)
		.attr('fill', '#fffff');

	plot2.select('#yaxis').call(d3.axisLeft(y_scale));
	plot2.select('#xaxis').append('text')
		.attr('transform', 'translate(' + lines_width / 2 + ',' + lines_height + ')')
		.attr('fill', '#fffff').text('2019 Respondent');
}

function plot_it() {

	populate_dropdown();
	setup_plots();
	// d3.csv('CoreTrends2018.csv').then(data => {
	// 	// data = $.csv.toObjects(data);
	// 	console.log(data)
	// 	processData(data);
	// 	plot_data();
	// })


}
