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
var socials = [
	{ name: "Twitter", code: "sns2a" },
	{ name: "Instagram", code: "sns2b" },
	{ name: "Facebook", code: "sns2c" },
	{ name: "Snapchat", code: "sns2d" },
	{ name: "YouTube", code: "sns2e" }
];
var toggleLines = true; // set to true for line graphs, false for bar graphs

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
	loadJSON(function (response) {
		// Parsing JSON string into object
		data18 = JSON.parse(response);
	}, 'data_2018.json');

	loadJSON(function (response) {
		// Parsing JSON string into object
		data19 = JSON.parse(response);
	}, 'data_2019.json');
}

init();

var handleLinesButt = () => {
	toggleLines = true;
	d3.select("#linesButton").attr("style", "background-color: #35c7f0");
	d3.select("#barsButton").attr("style", "background-color: #d9d9d9");
	setup_line_plots();
};

var handleBarsButt = () => {
	toggleLines = false;
	d3.select("#linesButton").attr("style", "background-color: #d9d9d9");
	d3.select("#barsButton").attr("style", "background-color: #35c7f0");
	setup_bar_plots();
};

// add the buttons to toggle between line and stacked bar charts
d3.select('body').append('button').attr('id', 'linesButton').text("Line graphs")
	.attr("onClick", "handleLinesButt(this)");
d3.select('body').append('button').attr('id', 'barsButton').text("Stacked bar graphs")
	.attr("onClick", "handleBarsButt(this)");


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

var setupFilters = () => {
	d3.select('body').append('div').attr('id', 'filters');

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
		.attr("onClick", "handleUpdateLines(this)")
		.property("checked", function (d, i) { return i === 0; });
};

function setup_bar_plots() {

}

//Create SVG elements and perform transforms to prepare for visualization
function setup_line_plots() {
	setupFilters();
	d3.select('body').append('svg').attr('width', 1000).attr('height', 1000).attr('transform', 'translate(5,5)')

	d3.select('svg').append('g').attr('transform', 'translate(' + pad + ',' + pad + ')').attr('id', 'svg');
	
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
}

var createSocialArr = (arr,v) => {
	socials.map(s => {
		arr[s.name] = [];
		for (var i=1; i<=5; i++) {
			arr[s.name].push({ key: i, value: v.filter(data => parseInt(data[s.code]) == i).length / v.length});
		}
	});
	return arr;
};

function handleUpdateLines(e) {
	switch (e.id) {
		case "Sex":
			filteredData18 = d3.nest()
				.key(d => { return d.sex })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr(arr,v);
					return arr;
				})
				.entries(data18);
			filteredData19 = d3.nest()
				.key(d => { return d.sex })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr(arr,v);
					return arr;
				})
				.entries(data19);
			break;
		case "Race":
			filteredData18 = d3.nest()
				.key(d => { return d.racecmb })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr(arr,v);
					return arr;
				})
				.entries(data18);
			filteredData19 = d3.nest()
				.key(d => { return d.racecmb })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr(arr,v);
					return arr;
				})
				.entries(data19);
			break;
	}
	plot_sm_lines();
}


function plot_sm_lines() {
	console.log("PLOTTING DATA");

	var svg = d3.select('#svg');
	svg.selectAll('g').remove(); //clear plots

	var x_scale = d3.scaleLinear().domain([1, 5]).range([0, lines_width / 2]);
	var y_scale = d3.scaleLinear().domain([0, .3]).range([lines_height / 2 - pad, 0]);

	for (i = 0; i < filteredData18.length; i++) {
		let plot = svg.append('g').attr('id', 'plot');
		//console.log(filteredData18[i].value);
		Object.keys(filteredData18[i].value).forEach(sm => {
			console.log(sm)
			// get the array we want
			arr = filteredData18[i].value[sm];	
			plot.append('path')
				.datum(arr)
				.attr("d", d3.line().x(d => x_scale(d.key)).y(d => {console.log(d.value); return y_scale(d.value)}))
				.attr("fill", "none")
				.attr("stroke", "steelblue")
				.attr("stroke-width", 1.5);
		});

		// group that will contain y axis for our line plot (id: yaxis)
		plot.append('g').attr('id', 'yaxis').call(d3.axisLeft(y_scale));
		let  yaxis = [">1 per day", "1 per day", ">3 per week", "<1 per week", "Less often"];
		// group that will contain x axis for both our line plot and heatmap (id: xaxis)
		plot.append('g').attr('id', 'xaxis')
			.call(d3.axisBottom(x_scale).ticks(5)
			.tickFormat(i => { return yaxis[i - 1] }))
			.attr('transform', 'translate(0' + ',' + (lines_height/2 - pad) + ')');
	}
}
