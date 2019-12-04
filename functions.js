// widths and heights for our plots - you should use these in constructing scales
var width = 1500, height = 1500;
var pad = 80;
var lines_width = width / 2 - (2 * pad);
var lines_height = height / 2 - (2 * pad);
var data = null;
var data18 = null; // contains 2018 data in json object
var data19 = null; // contains 2019 data in json object
var filteredData18 = null; //contains filtered object
var filteredData19 = null; //contains filtered object
var seriesData18 = null;
var seriesData19 = null;
var socials = [
	{ name: "Twitter", code: "sns2a" },
	{ name: "Instagram", code: "sns2b" },
	{ name: "Facebook", code: "sns2c" },
	{ name: "Snapchat", code: "sns2d" },
	{ name: "YouTube", code: "sns2e" }
];
var socialsMap = {
	Twitter: "sns2a",
	Instagram: "sns2b",
	Facebook: "sns2c",
	Snapchat: "sns2d",
	YouTube: "sns2e"
};
var socialsColors = {
	Twitter: "#00A1AD",
	Instagram: "#A700F4",
	Facebook: "#0064B7",
	Snapchat: "#EFA700",
	YouTube: "#AD0B00"
};
var barSocials = ["Twitter"];
var toggleLines = true; // set to true for line graphs, false for bar graphs
var firstToggle = false;
var races = ["White", "Black", "Asian", "Other", "Native American", "Prefer not to answer"];
var currentFilter = null;

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
	if (toggleLines && firstToggle) return;
	firstToggle = true;
	toggleLines = true;
	d3.select("#linesButton").attr("style", "background-color: #35c7f0");
	d3.select("#barsButton").attr("style", "background-color: #d9d9d9");
	d3.selectAll("#filters").remove();
	d3.selectAll("#barsParent").remove();
	setup_line_plots();
};

var handleBarsButt = () => {
	if (!toggleLines && firstToggle) return;
	firstToggle = true;
	toggleLines = false;
	d3.select("#linesButton").attr("style", "background-color: #d9d9d9");
	d3.select("#barsButton").attr("style", "background-color: #35c7f0");
	d3.selectAll("#parentSvg").remove();
	d3.selectAll("#filters").remove();
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

var setupBarFilters = () => {
	d3.select('body').append('div').attr('id', 'filters');

	d3.select('#filters').append('text').text('Filters');

	d3.select('#filters').append('form')
		.selectAll("label")
		.data(["Sex", "Race"])
		.enter()
		.append("label")
		.text(function (d) { return d; })
		.insert('input')
		.attr("type", "radio")
		.attr("id", function (d, i) { return d; })
		.attr('name', 'mode')
		.attr("onClick", "handleUpdateBars(this)")
		.property("checked", function (d, i) { return i === 0; });
};

var handleUpdateSocial = (e) => {
	if (e.checked) {
		if (!barSocials.includes(e.id)) {
			barSocials.push(e.id);
		}
	}	
	if (!e.checked) {
		barSocials = barSocials.filter(s => s !== e.id); 
	}
	plotBars();
};

var setupBarSocials = () => {
	d3.select('#filters').append('div').attr('id', 'socialFilters');

	d3.select('#socialFilters').append('form')
	.selectAll("label")
	.data(["Twitter", "YouTube"])
	.enter()
	.append("label")
	.text(function (d) { return d; })
	.insert('input')
	.attr("type", "checkbox")
	.attr("id", function (d, i) { return d; })
	.attr('name', 'mode')
	.attr("onClick", "handleUpdateSocial(this)")
	.property("checked", function (d, i) { return i === 0; });
};

//console.log(data19.filter(d => {  return d.racecmb == "9";}));

var handleUpdateBars = (e) => {
	currentFilter = e.id;
	switch (e.id) {
		case "Sex":
			filteredData18 = d3.nest()
				.key(d => { return d.sex })
				.rollup(v => {
					var arr = {};
<<<<<<< HEAD
					arr = createSocialArr2(arr,v);
=======
					arr = createSocialArr(arr, v);
>>>>>>> c0125d6730e59187cd545a42134fad7b0747db55
					return arr;
				})
				.entries(data18);
			filteredData19 = d3.nest()
				.key(d => { return d.sex })
				.rollup(v => {
					var arr = {};
<<<<<<< HEAD
					arr = createSocialArr2(arr,v);
=======
					arr = createSocialArr(arr, v);
>>>>>>> c0125d6730e59187cd545a42134fad7b0747db55
					return arr;
				})
				.entries(data19);
			break;

		case "Race":
			filteredData18 = d3.nest()
				.key(d => { return d.racecmb })
				.rollup(v => {
					var arr = {};
<<<<<<< HEAD
					arr = createSocialArr2(arr,v,v[0].racecmb);
					arr.columns = ["social", "1", "2", "3", "4", "5"];
=======
					arr = createSocialArr(arr, v);
>>>>>>> c0125d6730e59187cd545a42134fad7b0747db55
					return arr;
				})
				.entries(data18)
				.filter(d => d.key !== "9"); 
			filteredData19 = d3.nest()
				.key(d => { return d.racecmb })
				.rollup(v => {
					var arr = {};
<<<<<<< HEAD
					arr = createSocialArr2(arr,v,v[0].racecmb);
					arr.columns = ["social", "1", "2", "3", "4", "5"];
=======
					arr = createSocialArr(arr, v);
>>>>>>> c0125d6730e59187cd545a42134fad7b0747db55
					return arr;
				})
				.entries(data19)
				.filter(d => d.key !== "9");
			break;
			
	};
	//console.log(filteredData18)
	plotBars(filteredData18);
	//console.log("raw filteredData18");

};

var plotBars = (filteredData) => {
	if (!filteredData) return;
	var svg = d3.select('#barsSvg');
	svg.selectAll('g').remove(); //clear plots
	let plot = svg.append('g').attr('id', 'plot');

	var socialNum = 5; // number of social media selected, using all for now
	var binNum = 5; // number of bins (# of groups of bars)

	var barHeight = 250;
	var barWidth = 25;
	var barPad = 7;
	var outerBarPad = 5;
	var innerWidth = socialNum * (2*barPad+barWidth);
	var innerWidthPad = innerWidth + 2*outerBarPad; 
	var outerWidth = innerWidthPad * binNum;
	console.log("innerwidthpad: " + innerWidthPad);
	console.log("outerwidth: " + outerWidth);

	var x_inner = d3.scaleBand().domain(socials.map(d => d.name)).range([0, innerWidth]).padding(barPad);
	var x_outer = d3.scaleBand().domain(['1','2','3','4','5']).range([0, outerWidth]);

	var y_scale = d3.scaleLinear().domain([0, 1]).range([barHeight, 0]);
	var colorScale = d3.scaleOrdinal().domain(socials.map(d => d.name)).range(["#00C7D6", "#AE00F9", "#006AC6", "#FFB600", "#D11100"]);

	//console.log(filteredData18);
	//if (filteredData18 == null) plotBars();
	filteredData.forEach(fd => {
		var data = fd.value;
		//console.log("pre");
		//console.log(fd.value);
		fd.value = d3.stack().keys(data.columns.slice(1))(data);
		fd.value = fd.value.map(d => {
			//console.log(JSON.parse(JSON.stringify(d.key)));
			var key = JSON.parse(JSON.stringify(d.key));
			//var key = d.key;
			d = d.map(e => {
				//console.log(key);
				e.data.freq = key;
				//console.log(e.data);
				return e;
			});
			return d;
		});
		//console.log("post");
		//console.log(fd.value);
	});
	//console.log("series filtered");

	//console.log(filteredData);
	var opacityScale = d3.scaleLinear().domain([0,4]).range([1,0.12]);

	filteredData.forEach(fd => {
		//console.log(index);
		//console.log(fd.value);
		var serie = svg.append('g').selectAll('.serie')
					.data(fd.value)
					.enter().append('g')
						.attr("class", "serie")
						.attr("opacity", (d,i) => { console.log(i); return opacityScale(i);})

						
	
		serie.selectAll('rect')
		//.data((d,i) => {return {d: d, i: i}; })
		.data(d => d)
		.enter().append('rect')
			.attr('class', 'serie-rect')
			.attr("transform", function(d) { return "translate(" + x_inner(d.data.social) + ",0)"; })
			.attr("x", function(d) { /*console.log( x_outer(d.data.attr));*/ return x_outer(d.data.attr); })
			.attr("y", function(d) { return y_scale(d[1]); })
			.attr("height", function(d) { return y_scale(d[0]) - y_scale(d[1]); })
			.attr("width", "25px")
			.attr("fill", (d => { return socialsColors[d.data.social]; }));  //tintScale(i, d.data.social);


		
	});
	
	
	/*
	var index = 0
	filteredData18.map(fd => {
		//console.log(fd);
		//fd.value.map(data => {
			svg.append('g')
			.selectAll('g')
			.data(fd.value)
			.enter().append('g')
				.attr("fill", d => { console.log(d); return tintScale(d.key,"d.data.data.name");})
			.selectAll('rect')
			.data(d => d)
			.enter().append('rect')
				.attr('x', (d,i) => {
					//console.log(d);
					return outerBarPad + index*(innerWidthPad+outerBarPad) + x_inner(d.data.name);
				})
				.attr('y', d => y_scale(d[0]) - y_scale(d[1]))
				.attr('width', x_inner.bandwidth());
		//})
		
		index++;
	});
	*/
	

	plot.append('g').attr('id', 'yaxis').call(d3.axisLeft(y_scale));
	//plot.append('g').attr('id', 'xaxis').call(d3.axisLeft(y_scale));

};

var tintScale = (input, social) => {
	if (social == "Twitter") {
		var scale = d3.scaleOrdinal().domain(["1","2","3","4","5"]).range(["#003438","#00636B","#00939E","#00C7D6","#0AEEFF"]);
	}
	if (social == "Instagram") {
		var scale = d3.scaleOrdinal().domain(["1","2","3","4","5"]).range(["#7200A3","#9500D6","#B50AFF","#DB89FF","#E3A3FF"]);
	}
	if (social == "Facebook") {
		var scale = d3.scaleOrdinal().domain(["1","2","3","4","5"]).range(["#003360","#00549E","#0074DB","#2398FF","#75BEFF"]);
	}
	if (social == "Snapchat") {
		var scale = d3.scaleOrdinal().domain(["1","2","3","4","5"]).range(["#996D00","#CC9200","#F4AF00","#FFC532","#FFDC84"]);
	}
	if (social == "YouTube") {
		var scale = d3.scaleOrdinal().domain(["1","2","3","4","5"]).range(["#7F0800","#B20B00","#DB0E00","#FF746B","#FFB7B2"]);
	}
	return scale(input);
};

var setup_bar_plots = () => {
	setupBarFilters();
	setupBarSocials();
	d3.select('body').append('svg').attr('width', 2000).attr('height', 2000).attr('transform', 'translate(5,5)').attr("id", "barsParent");
	d3.select('#barsParent').append('g').attr('transform', 'translate(' + pad + ',' + pad + ')').attr('id', 'barsSvg');
	plotBars();
}

//Create SVG elements and perform transforms to prepare for visualization
function setup_line_plots() {
	setupFilters();
	d3.select('body').append('svg').attr('width', 1000).attr('height', 1000).attr('transform', 'translate(5,5)').attr("id", "parentSvg");

	d3.select('svg').append('g').attr('transform', 'translate(' + pad + ',' + pad + ')').attr('id', 'svg');
	document.getElementById("Race").click()

}

var createSocialArr = (arr, v) => {

	socials.map(s => {
		arr[s.name] = [];
		for (var i = 1; i <= 5; i++) {
			arr[s.name].push({ key: i, value: v.filter(data => parseInt(data[s.code]) == i).length / v.length });
		}
	});
	return arr;
};

// attrVal is like male/female, hispanic/asian/black, etc
var createSocialArr2 = (arr, v, attrVal) => {
	arr2 = [];
	var index = 0;
	socials.map(s => {
		//arr2.push({});
		arr2[index] = {social: s.name, attr: attrVal};
		for (var i = 1; i <= 5; i++) {
			var filteredV = v.filter(d => parseInt(d[s.code])>=1 || parseInt(d[s.code])<=5);
			arr2[index][i] =  v.filter(data => parseInt(data[s.code]) == i).length / filteredV.length;
			//arr[s.name].push({ key: i, value: v.filter(data => parseInt(data[s.code]) == i).length / filteredV.length });
		}
		index++;
	});
	return arr2;
};

function handleUpdateLines(e) {
	switch (e.id) {
		case "Sex":
			filteredData18 = d3.nest()
				.key(d => { return d.sex })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr(arr, v);
					return arr;
				})
				.entries(data18);
			filteredData19 = d3.nest()
				.key(d => { return d.sex })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr(arr, v);
					return arr;
				})
				.entries(data19);
			break;
		case "Race":
			filteredData18 = d3.nest()
				.key(d => { return d.racecmb })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr(arr, v);
					return arr;
				})
				.entries(data18)
				.filter(d => d.key !== "9");
			filteredData19 = d3.nest()
				.key(d => { return d.racecmb })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr(arr, v);
					return arr;
				})
				.entries(data19)
				.filter(d => d.key !== "9"); 
			break;
	}
	plot_sm_lines();
}


function plot_sm_lines() {

	var svg = d3.select('#svg');
	svg.selectAll('g').remove(); //clear plots

	var x_scale = d3.scaleLinear().domain([1, 5]).range([0, lines_width / 2]);
	var y_scale = d3.scaleLinear().domain([0, .5]).range([lines_height / 2 - pad, 0]);
	var colorScale = d3.scaleOrdinal().domain([0, 4]).range(["#E74C3C", "#8E44AD", "#3498DB", "#1ABC9C", "#F39C12"]);

	for (i = 0; i < filteredData18.length; i++) {
		let plot = svg.append('g').attr('id', 'plot')
			.attr('transform', 'translate(' + ((i % 2) * (lines_width / 2 + pad - 20)) + ',' + (Math.trunc(i / 2 % 3) * (lines_height / 2 - pad / 2)) + ')');

		if (filteredData18.length == 2) {
			var sexes = ["Male", "Female"]
			plot.append('text').text(sexes[i])
				.attr('text-anchor', 'center')
				.attr('transform', 'translate(' + (lines_width / 4) + ',' + pad / 2 + ')');
		} else if (filteredData18.length == 6) {
			plot.append('text').text(races[i])
				.attr('text-anchor', 'center')
				.attr('transform', 'translate(' + (lines_width / 4) + ',' + pad / 2 + ')');
		}

		Object.keys(filteredData18[i].value).forEach((sm, index) => {
			// get the array we want
			arr = filteredData18[i].value[sm];
			plot.append('path')
				.datum(arr)
				.attr('data-legend', sm)
				.attr("d", d3.line().x(d => x_scale(d.key)).y(d => { return y_scale(d.value) }))
				.attr("fill", "none")
				.attr("stroke", colorScale(index))
				.attr("stroke-width", 3);
		});

		//console.log(filteredData18[i].value);
		Object.keys(filteredData19[i].value).forEach((sm, index) => {
			// get the array we want
			arr = filteredData19[i].value[sm];
			plot.append('path')
				.datum(arr)
				.attr('data-legend', sm)
				.style("stroke-dasharray", ("3, 3"))
				.attr("d", d3.line().x(d => x_scale(d.key)).y(d => { return y_scale(d.value) }))
				.attr("fill", "none")
				.attr("stroke", colorScale(index))
				.attr("stroke-width", 3);
		});

		if (i == 0 || i == 2 || i == 4) {
			// group that will contain y axis for our line plot (id: yaxis)
			plot.append('g').attr('id', 'yaxis').call(d3.axisLeft(y_scale));
		}

		let yaxis = [">1 per day", "1 per day", ">3 per week", "<1 per week", "Less often"];
		// group that will contain x axis for both our line plot and heatmap (id: xaxis)
		plot.append('g').attr('id', 'xaxis')
			.call(d3.axisTop(x_scale).ticks(5)
				.tickFormat(i => { return yaxis[i - 1] }))
			.attr('transform', 'translate(0' + ',' + 0 + ')');
	}
	//add legend
	svg.append('g').selectAll('circle').data(socials).enter()
		.append('circle')
		.attr("cx", lines_width + pad * 1.5).attr("cy", (d, i) => 100 + i * 30)
		.attr("r", 6).style("fill", (d, i) => { console.log(d); return colorScale(i) })
	svg.append('g').selectAll('text').data(socials).enter()
		.append("text")
		.attr("x", lines_width + pad * 1.6)
		.attr("y", (d, i) => 100 + i * 30)
		.text(d => d.name)
		.style("font-size", "15px")
		.attr("alignment-baseline", "middle")
	var legend_lines = {
		"dashed": [
			[700, 40],
			[715, 40]],
		"normal": [
			[700, 70],
			[715, 70]]
	}
	svg.append('g').attr('id', 'dashed').append('path')
		.attr('d', d3.line()(legend_lines.dashed))
		.style("stroke-dasharray", ("3, 3"))
		.attr('fill', 'none')
		.attr('stroke', 'black')
		.attr('stroke-width', 3)
		.append('text')
	svg.select('#dashed')
		.append('text')
		.text("2019")
		.style("font-size", "15px")
		.attr("alignment-baseline", "middle")
		.attr("x", lines_width + pad * 1.6)
		.attr('y', 40)

	svg.append('g').attr('id', 'dashed').append('path')
		.attr('d', d3.line()(legend_lines.normal))
		.attr('fill', 'none')
		.attr('stroke', 'black')
		.attr('stroke-width', 3)
		.append('text')
	svg.select('#dashed')
		.append('text')
		.text("2018")
		.style("font-size", "15px")
		.attr("alignment-baseline", "middle")
		.attr("x", lines_width + pad * 1.6)
		.attr('y', 70)
	// svg.append("text").attr("x", 220).attr("y", 160).text("variable B").style("font-size", "15px").attr("alignment-baseline", "middle")

}
