// widths and heights for our plots - you should use these in constructing scales
var width = 1000, height = 1000;
var pad = 25;
var lines_width = lines_width - (pad + pad), lines_height = lines_height - 2 * pad;

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
