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

var currSocials = ["Twitter"];

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
var toggleLines = true; // set to true for line graphs, false for bar graphs
var firstToggle = false;
var races = ["White", "Black", "Asian", "Other", "Native American", "Prefer not to answer"];
var currentFilter = null;
var raceMap = {
	1: "White",
	2: "Black",
	3: "Asian",
	4: "Other",
	5: "Native Amer."
};
var sexMap = {
	1: "Male",
	2: "Female"
};

var partyMap = {
	1: "Republican",
	2: "Democrat",
	3: "Independent"
};

var incomeMap = {
	1: "<10k",
	2: "10-20k",
	3: "20-30k",
	4: "30-40k",
	5: "40-50k",
	6: "50-75k",
	7: "75-100k",
	8: "100-150k",
	9: ">150k"
}
var maritalMap = {
	1: "Married",
	2: "Cohabiting w/ partner",
	3: "Divorced",
	4: "Separated",
	5: "Widowed",
	6: "Never married"
};
var filterMap = {
	Race: raceMap,
	Sex: sexMap,
	"Political Party": partyMap,
	Income: incomeMap,
	Marital: maritalMap
};

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

console.log(data18);

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

var filterRace = (data) => {
	return data.filter(data => parseInt(data.racecmb) >= 1 && parseInt(data.racecmb) <= 5);
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

var funcMap = {
	Twitter: filterTwitter,
	Instagram: filterInsta,
	Facebook: filterFb,
	YouTube: filterYt,
	Snapchat: filterSnap
};

var setupFilters = () => {
	d3.select('body').append('div').attr('id', 'filters');

	d3.select('#filters').append('text').text('Filters');

	d3.select('#filters').append('form')
		.selectAll("label")
		.data(["Race", "Sex", "Political Party", "Income", "Marital"])
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
		.data(["Sex", "Race", "Political Party", "Income", "Marital"])
		.enter()
		.append("label")
		.text(function (d) { return d; })
		.insert('input')
		.attr("type", "radio")
		.attr("id", function (d, i) { return d; })
		.attr('name', 'mode')
		.attr("onClick", "handleUpdateBars(this)")
		//.property("checked", function (d, i) { return i === 0; });
};

var handleUpdateSocial = (e) => {
	if (e.checked) {
		if (!currSocials.includes(e.id)) {
			currSocials.push(e.id);
		}
	}	
	if (!e.checked) {
		currSocials = currSocials.filter(s => s !== e.id); 
	}
	handleUpdateBars();
};

var setupBarSocials = () => {
	d3.select('#filters').append('div').attr('id', 'socialFilters');

	d3.select('#socialFilters').append('form')
	.selectAll("label")
	.data(["Twitter", "Instagram", "Facebook", "Snapchat", "YouTube"])
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


var handleUpdateBars = (e) => {
	if (e) currentFilter = e.id;
	switch (currentFilter) {
		case "Sex":
			filteredData18 = d3.nest()
				.key(d => { return d.sex })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr2(arr,v, v[0].sex, 1, 2);
					arr.columns = ["social", "1", "2", "3", "4", "5"];
					return arr;
				})
				.entries(data18);
			filteredData19 = d3.nest()
				.key(d => { return d.sex })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr2(arr,v, v[0].sex, 1, 2);
					arr.columns = ["social", "1", "2", "3", "4", "5"];
					return arr;
				})
				.entries(data19);
			break;

		case "Race":
			fData18 = filterRace(data18);
			filteredData18 = d3.nest()
				.key(d => { return d.racecmb })
				.rollup(v => {
					v = v.filter(d => d.key !== "9");
					var arr = {};
					arr = createSocialArr2(arr,v,v[0].racecmb, 1, 5);
					arr.columns = ["social", "1", "2", "3", "4", "5"];
					return arr;
				})
				.entries(fData18)
				.filter(d => d.key !== "9"); 
			filteredData19 = d3.nest()
				.key(d => { return d.racecmb })
				.rollup(v => {
					v = v.filter(d => d.key !== "9");
					var arr = {};
					arr = createSocialArr2(arr,v,v[0].racecmb, 1, 5);
					arr.columns = ["social", "1", "2", "3", "4", "5"];
					return arr;
				})
				.entries(data19)
				.filter(d => d.key !== "9");
			break;

			case "Political Party":
			filteredData18 = d3.nest()
				.key(d => { return d.party })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr2(arr,v,v[0].party, 1, 3);
					arr.columns = ["social", "1", "2", "3", "4", "5"];
					return arr;
				})
				.entries(data18)
				.filter(d => d.key >= "1" && d.key <= "3"); 
			filteredData19 = d3.nest()
				.key(d => { return d.party })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr2(arr,v,v[0].party, 1, 3);
					arr.columns = ["social", "1", "2", "3", "4", "5"];
					return arr;
				})
				.entries(data19)
				.filter(d => d.key >= "1" && d.key <= "3"); 
			break;

			case "Income":
			filteredData18 = d3.nest()
				.key(d => { return d.inc })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr2(arr,v,v[0].inc, 1, 9);
					arr.columns = ["social", "1", "2", "3", "4", "5"];
					return arr;
				})
				.entries(data18)
				.filter(d => d.key >= "1" && d.key <= "9"); 
			filteredData19 = d3.nest()
				.key(d => { return d.inc })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr2(arr,v,v[0].inc, 1, 9);
					arr.columns = ["social", "1", "2", "3", "4", "5"];
					return arr;
				})
				.entries(data19)
				.filter(d => d.key >= "1" && d.key <= "9"); 
			break;

			case "Marital":
			filteredData18 = d3.nest()
				.key(d => { return d.marital })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr2(arr,v,v[0].marital, 1, 6);
					arr.columns = ["social", "1", "2", "3", "4", "5"];
					return arr;
				})
				.entries(data18)
				.filter(d => d.key >= "1" && d.key <= "6"); 
			filteredData19 = d3.nest()
				.key(d => { return d.marital })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr2(arr,v,v[0].marital, 1, 6);
					arr.columns = ["social", "1", "2", "3", "4", "5"];
					return arr;
				})
				.entries(data19)
				.filter(d => d.key >= "1" && d.key <= "6"); 
			break;
			
	};
	plotBars(filteredData18);

};

var plotBars = (filteredData) => {
	if (!filteredData) return;
	var svg = d3.select('#barsSvg');
	svg.selectAll('g').remove(); //clear plots
	let plot = svg.append('g').attr('id', 'plot');

	var socialNum = currSocials.length; // number of social media selected, using all for now
	var currMap = filterMap[currentFilter]; // number of bins (# of groups of bars)
	var xdomain = [];
    for (var i = 0; i < Object.keys(currMap).length	; i++) {
        xdomain.push(i+1);
    }
	var binNum = xdomain.length;

	var barHeight = 250;
	var barWidth = 25;
	var barPad = 7;
	var outerBarPad = 5;
	var innerWidth = socialNum * (2*barPad+barWidth);
	var innerWidthPad = innerWidth + 2*outerBarPad; 
	var outerWidth = innerWidthPad * binNum;

	var x_inner = d3.scaleBand().domain(currSocials).range([0, innerWidth]).padding(barPad);
	var x_outer = d3.scaleBand().domain(xdomain).range([0, outerWidth]);

	var y_scale = d3.scaleLinear().domain([0, 1]).range([barHeight, 0]);
	var colorScale = d3.scaleOrdinal().domain(currSocials).range(["#00C7D6", "#AE00F9", "#006AC6", "#FFB600", "#D11100"]);

	filteredData.forEach(fd => {
		var data = fd.value;
		fd.value = d3.stack().keys(data.columns.slice(1))(data);
		fd.value = fd.value.map(d => {
			var key = JSON.parse(JSON.stringify(d.key));
			d = d.map(e => {
				e.data.freq = key;
				return e;
			});
			return d;
		});
	});
	var opacityScale = d3.scaleLinear().domain([0,4]).range([1,0.12]);

	filteredData.forEach(fd => {
		var serie = svg.append('g').selectAll('.serie')
					.data(fd.value)
					.enter().append('g')
						.attr("class", "serie")
						.attr("opacity", (d,i) => { return opacityScale(i);})

						
	
		serie.selectAll('rect')
		.data(d => d)
		.enter().append('rect')
			.attr('class', 'serie-rect')
			.attr("transform", function(d) { return "translate(" + x_inner(d.data.social) + ",0)"; })
			.attr("x", function(d) { return x_outer(d.data.attr) - outerBarPad; })
			.attr("y", function(d) { return y_scale(d[1]); })
			.attr("height", function(d) { return y_scale(d[0]) - y_scale(d[1]); })
			.attr("width", "25px")
			.attr("fill", (d => { return socialsColors[d.data.social]; }));  //tintScale(i, d.data.social);


		
	});
	
	plot.append('g').attr('id', 'yaxis').call(d3.axisLeft(y_scale));
	plot.append('g').attr('id', 'xaxis').call(d3.axisBottom(x_outer).tickFormat(d => currMap[d])).attr("transform", "translate(0," + barHeight + ")")
		
	svg.append('g').selectAll('circle').data(currSocials).enter()
		.append('circle')
		.attr("cx", outerWidth + pad).attr("cy", (d, i) => 100 + i * 30)
		.attr("r", 6).style("fill", (d, i) => { return socialsColors[d] })
	svg.append('g').selectAll('text').data(currSocials).enter()
		.append("text")
		.attr("x", outerWidth + pad * 1.2)
		.attr("y", (d, i) => 100 + i * 30)
		.text(d => d)
		.style("font-size", "15px")
		.attr("alignment-baseline", "middle")
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
	d3.select('body').append('svg').attr('width', 1000).attr('height', 10000).attr('transform', 'translate(5,5)').attr("id", "parentSvg");

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
var createSocialArr2 = (arr, v, attrVal, lower, upper) => {
	arr2 = [];
	var index = 0;
	socials.map(s => {
		if (!currSocials.includes(s.name)) return;
		arr2[index] = {social: s.name, attr: attrVal};
		for (var i = 1; i <= 5; i++) {
			var filteredV = v.filter(d => parseInt(d[s.code])>=lower || parseInt(d[s.code])<=upper);
			var func = funcMap[s.name];
			var filteredV = func(filteredV);
			arr2[index][i] =  v.filter(data => parseInt(data[s.code]) == i).length / filteredV.length;
			//arr[s.name].push({ key: i, value: v.filter(data => parseInt(data[s.code]) == i).length / filteredV.length });
		}
		index++;
	});
	return arr2;
};

function handleUpdateLines(e) {
	if (e) currentFilter = e.id;
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
		case "Political Party":
				filteredData18 = d3.nest()
					.key(d => { return d.party })
					.rollup(v => {
						var arr = {};
						arr = createSocialArr(arr, v);
						return arr;
					})
					.entries(data18)
					.filter(d => d.key >= "1" && d.key <= "3");
				filteredData19 = d3.nest()
					.key(d => { return d.party })
					.rollup(v => {
						var arr = {};
						arr = createSocialArr(arr, v);
						return arr;
					})
					.entries(data19)
					.filter(d => d.key >= "1" && d.key <= "3");
				break;

		case "Income":
				filteredData18 = d3.nest()
					.key(d => { return d.inc })
					.rollup(v => {
						var arr = {};
						arr = createSocialArr(arr, v);
						return arr;
					})
					.entries(data18)
					.filter(d => d.key <= "9");
				filteredData19 = d3.nest()
					.key(d => { return d.inc })
					.rollup(v => {
						var arr = {};
						arr = createSocialArr(arr, v);
						return arr;
					})
					.entries(data19)
					.filter(d => d.key <= "9"); 
				break;

		case "Marital":
			filteredData18 = d3.nest()
				.key(d => { return d.marital })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr(arr, v);
					return arr;
				})
				.entries(data18)
				.filter(d => d.key >= "1" && d.key <= "6"); 
			filteredData19 = d3.nest()
				.key(d => { return d.marital })
				.rollup(v => {
					var arr = {};
					arr = createSocialArr(arr, v);
					return arr;
				})
				.entries(data19)
				.filter(d => d.key >= "1" && d.key <= "6"); 
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
	console.log(filteredData18);
	for (i = 0; i < filteredData18.length; i++) {
		let plot = svg.append('g').attr('id', 'plot')
			.attr('transform', 'translate(' + ((i % 2) * (lines_width / 2 + pad - 20)) + ',' + (Math.trunc(i / 2 % 5) * (lines_height / 2 - pad / 2)) + ')');
		console.log(filteredData18.length);
		var currMap = filterMap[currentFilter];

		plot.append('text').text(currMap[i+1])
		.attr('text-anchor', 'center')
		.attr('transform', 'translate(' + (lines_width / 4) + ',' + pad / 5 + ')');
		/*
		var currMap = filterMap[currentFilter];
		if (currentFilter == "Sex") {
			var sexes = ["Male", "Female"]
			plot.append('text').text(currMap[i+1])
				.attr('text-anchor', 'center')
				.attr('transform', 'translate(' + (lines_width / 4) + ',' + pad / 5 + ')');
	
		} else if (currentFilter == "Race") {
			plot.append('text').text(currMap[i+1])
				.attr('text-anchor', 'center')
				.attr('transform', 'translate(' + (lines_width / 4) + ',' + pad / 5 + ')');
		
		}
		*/
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
			console.log(arr);
		});

		// group that will contain y axis for our line plot (id: yaxis)
		plot.append('g').attr('id', 'yaxis').call(d3.axisLeft(y_scale));

		
		

		let yaxis = [">1 per day", "1 per day", ">3 per week", "<1 per week", "Less often"];
		// group that will contain x axis for both our line plot and heatmap (id: xaxis)
		var plotheight = lines_height/2 - pad;
		plot.append('g').attr('id', 'xaxis')
			.call(d3.axisBottom(x_scale).ticks(5)
				.tickFormat(i => { return yaxis[i - 1] }))
				.attr("transform", "translate(0," + plotheight + ")")
			//.attr('transform', 'translate(0' + ',' + 0 + ')');
	}
	//add legend
	svg.append('g').selectAll('circle').data(socials).enter()
		.append('circle')
		.attr("cx", lines_width + pad * 1.5).attr("cy", (d, i) => 100 + i * 30)
		.attr("r", 6).style("fill", (d, i) => { return colorScale(i) })
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
