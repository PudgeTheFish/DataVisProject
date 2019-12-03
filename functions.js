// widths and heights for our plots - you should use these in constructing scales
var width = 1000, height = 1000;
var pad = 25;
var lines_width = width / 2 - (2 * pad);
var lines_height = height / 2 - (2 * pad);
var data = null;
var data18 = null; // contains 2018 data in json object
var data19 = null; // contains 2019 data in json object
var filteredData18 = null; //contains filtered object
var filteredData19 = null; //contains filtered object


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
	loadJSON(function (response) {
		// Parsing JSON string into object
		data18 = JSON.parse(response);
		console.log(data18);
	}, 'data_2018.json');

	loadJSON(function (response) {
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
	data['books'] = data.filter(data => parseInt(data.books1) < 98);
}

//Create SVG elements and perform transforms to prepare for visualization
function setup_line_plots() {
	d3.select('body').append('div').attr('id', 'filters');
	d3.select('body').append('svg').attr('width', 1000).attr('height', 1000).attr('transform', 'translate(5,5)')

	d3.select('svg').append('g').attr('transform', 'translate(' + pad + ',' + pad + ')').attr('id', 'plot1');
	d3.select('svg').append('g').attr('transform', 'translate(' + (3 * pad + lines_width) + ',' + pad + ')').attr('id', 'plot2');


	d3.select('#filters').append('text').text('Filters');

	d3.select('#filters').append('form')
		.selectAll("label")
		.data(["Race", "Sex"])
		.enter()
		.append("label")
		.text(function (d) { return d; })
		.insert('input')
		.attr("type", "radio")
		.attr("id", function (d, i) { return d; })
		.attr('name', 'mode')
		.attr("onClick", "handleUpdate(this)")
		.property("checked", function (d, i) { return i === 0; });

	// d3.select('#filters').append('div')
	// 	.attr('id', 'raceCheckbox')
	// 	.append('text').text('Race: ')
	// d3.select('#filters').select('#raceCheckbox')
	// 	.selectAll("input")
	// 	.data(["White", "Black", "Asian", "Other", "Native American", "Pacific Islander", "Hispanic"])
	// 	.enter()
	// 	.append('label')
	// 	.attr('for', function (d, i) { return i + 1; })
	// 	.text(function (d) { return d; })
	// 	.append("input")
	// 	.attr("checked", true)
	// 	.attr("type", "checkbox")
	// 	.attr("id", function (d, i) { return i + 1; })
	// 	.attr("onClick", "handleUpdate()");

	// d3.select('#filters').append('div')
	// 	.attr('id', 'sexCheckbox')
	// 	.append('text').text('Sex: ')
	// d3.select('#filters').select('#sexCheckbox')
	// 	.selectAll("input")
	// 	.data(["Male", "Female"])
	// 	.enter()
	// 	.append('label')
	// 	.attr('for', function (d, i) { return i + 1; })
	// 	.text(function (d) { return d; })
	// 	.append("input")
	// 	.attr("checked", true)
	// 	.attr("type", "checkbox")
	// 	.attr("id", function (d, i) { return i + 1; })
	// 	.attr("onClick", "handleUpdate()");


	// group that will contain y axis for our line plot (id: yaxis)
	d3.select('#plot1').append('g').attr('id', 'yaxis');
	// group that will contain x axis for both our line plot and heatmap (id: xaxis)
	d3.select('#plot1').append('g').attr('id', 'xaxis');

	// group that will contain y axis for our line plot (id: yaxis)
	d3.select('#plot2').append('g').attr('id', 'yaxis');
	// group that will contain x axis for both our line plot and heatmap (id: xaxis)
	d3.select('#plot2').append('g').attr('id', 'xaxis');

}

function handleUpdate(e) {
	switch (e.id) {
		case "Sex":
			filteredData18 = d3.nest()
				.key(d => { return d.sex })
				.rollup(v => {
					var arr = {};
					arr["Twitter"] = {
						1: v.filter(data => parseInt(data.sns2a) == 1).length/v.length,
						2: v.filter(data => parseInt(data.sns2a) == 2).length/v.length,
						3: v.filter(data => parseInt(data.sns2a) == 3).length/v.length,
						4: v.filter(data => parseInt(data.sns2a) == 4).length/v.length,
						5: v.filter(data => parseInt(data.sns2a) == 5).length/v.length,
					}
					arr["Instagram"] = {
						1: v.filter(data => parseInt(data.sns2b) == 1).length/v.length,
						2: v.filter(data => parseInt(data.sns2b) == 2).length/v.length,
						3: v.filter(data => parseInt(data.sns2b) == 3).length/v.length,
						4: v.filter(data => parseInt(data.sns2b) == 4).length/v.length,
						5: v.filter(data => parseInt(data.sns2) == 5).length/v.length,
					}
					// 	d3.count(v, v => v.web1a)/filteredData18.length;
					// arr["Instagram"] = d3.count(v => v.web1b)/filteredData18.length;
					// arr["Facebook"] = d3.count(v => v.web1c)/filteredData18.length;
					// arr["Snapchat"] = d3.count(v => v.web1d)/filteredData18.length;
					// arr["YouTube"] = d3.count(v => v.web1e)/filteredData18.length;
					return arr;
				})
				.entries(data18);
			filteredData19 = d3.nest()
				.key(d => { return d.sex })
				.entries(data19);
			// d3.rollup(filteredData18, v => {
			// 	var arr = {};
			// 	arr["Twitter"] = d3.count(v.web1a)/filteredData18.length;
			// 	arr["Instagram"] = d3.count(v.web1b)/filteredData18.length;
			// 	arr["Facebook"] = d3.count(v.web1c)/filteredData18.length;
			// 	arr["Snapchat"] = d3.count(v.web1d)/filteredData18.length;
			// 	arr["YouTube"] = d3.count(v.web1e)/filteredData18.length;
			// 	return arr;
			// }, d => d.key)
			console.log(filteredData18);
			break;
		case "Race":
			filteredData18 = d3.nest()
				.key(d => { return d.racecmb })
				.entries(data18);
			filteredData19 = d3.nest()
				.key(d => { return d.racecmb })
				.entries(data19);
			break;
	}
	plot_sm_lines();
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

function plot_books() {

	//filter data
	filterBooks(data18);
	filterBooks(data19);

	console.log("PLOTTING DATA");

	var plot1 = d3.select('#plot1');
	var plot2 = d3.select('#plot2');

	var x_scale = d3.scaleLinear().domain([0, data18.books.length]).range([0, lines_width]);
	var y_scale = d3.scaleLinear().domain([0, d3.max(data18.books, d => d.books1)]).range([lines_height - pad, 0]);

	plot1.selectAll('g').data(data18.books).enter()
		.append('circle').attr('cx', (d, i) => { return x_scale(i) })
		.attr('cy', d => y_scale(d.books1)).attr('r', 2)
		.attr('fill', '#fffff');

	plot1.select('#yaxis').call(d3.axisLeft(y_scale));
	plot1.select('#xaxis').append('text')
		.attr('transform', 'translate(' + 0 + ',' + lines_height + ')')
		.attr('fill', '#fffff').text('2018 Respondent');

	plot2.selectAll('g').data(data19.books).enter()
		.append('circle').attr('cx', (d, i) => { return x_scale(i) })
		.attr('cy', d => y_scale(d.books1)).attr('r', 2)
		.attr('fill', '#fffff');

	plot2.select('#yaxis').call(d3.axisLeft(y_scale));
	plot2.select('#xaxis').append('text')
		.attr('transform', 'translate(' + 0 + ',' + lines_height + ')')
		.attr('fill', '#fffff').text('2019 Respondent');
}

function filterData() {

}

function plot_sm_lines() {
	console.log("PLOTTING DATA");

	var plot1 = d3.select('#plot1');

	var x_scale = d3.scaleLinear().domain([1, 5]).range([0, lines_width/2]);
	var y_scale = d3.scaleLinear().domain([0, 100]).range([lines_height/2 - pad, 0]);

	for(i =0; i < filteredData18.length; i++) {
		plot1.data(filteredData18[i]).enter()
			.append()
	}
}

function plot_it() {

	populate_dropdown();
	setup_plots();
	plot_books();



}
