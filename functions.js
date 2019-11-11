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

function plot_it() {

	setup_plots();

}
