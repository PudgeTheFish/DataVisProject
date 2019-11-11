// HINT: you should use this function for creating elements of type `element_name`
function create_dom_element(element_name) {
	return document.createElementNS('http://www.w3.org/2000/svg', element_name);
}

function get_single_element_by_name(element_name) {
	return document.getElementsByTagName(element_name)[0];
}

// TODO: create and return a `circle` element, whose attributes are set based on the `circle_datum` argument.
// You should assume `circle_datum` is an object with the following properties:
// `cx`: the x-coordinate of the center of the circle
// `cy`: the y-coordinate of the center of the circle
// `r`: the radius of the circle
// `fill`: the fill color of the circle
function create_circle_element(circle_datum) {
	var circle = create_dom_element('circle');
	circle.setAttribute('cx', circle_datum.cx);
	circle.setAttribute('cy', circle_datum.cy);
	circle.setAttribute('r', circle_datum.r);
	circle.setAttribute('fill', circle_datum.fill);
	return circle;
}

// TODO: create and return a `rect` element, whose attributes are set based on the `rect_datum` argument.
// You should assume `rect_datum` is an object with the following properties:
// `x`: the x-coordinate of where the rectangle begins
// `y`: the y-coordinate of where the rectangle begins
// `width`: the width of the rectangle
// `height`: the height of the rectangle
// `fill`: the fill color of the rectangle
function create_rect_element(rect_datum) {
	let rect = create_dom_element('rect');
	rect.setAttribute('x', rect_datum.x);
	rect.setAttribute('y', rect_datum.y);
	rect.setAttribute('width', rect_datum.width);
	rect.setAttribute('height', rect_datum.height);
	rect.setAttribute('fill', rect_datum.fill);
	return rect;
}

// TODO: create and return a `line` element, whose attributes are set based on the `line_datum` argument.
// You should assume `line_datum` is an object with the following properties:
// `x1`: the x-coordinate of the start of the line
// `y1`: the y-coordinate of the start of the line
// `x2`: the x-coordinate of the end of the line
// `y2`: the y-coordinate of the end of the line
// `stroke-width`: the width of the line
// `stroke`: the stroke color of the line
function create_line_element(line_datum) {
	let line = create_dom_element('line')
	line.setAttribute('x1', line_datum.x1);
	line.setAttribute('y1', line_datum.y1);
	line.setAttribute('x2', line_datum.x2);
	line.setAttribute('y2', line_datum.y2);
	line.setAttribute('stroke-width', line_datum['stroke-width']);
	line.setAttribute('stroke', line_datum.stroke);
	return line;
}

function plot_it() {

	// this is our main SVG element - where all of our graphics will be drawn
	var svg_element = get_single_element_by_name('svg');

	// these are the individual groups, where our separate plots (points, bars, box plots) will be drawn
	// we assign each a transformation, telling it how to transform all of its child elements (points, rects, lines, and other groups!)
	var point_group = create_dom_element('g');
	point_group.setAttribute('transform', 'translate(40,40)');
	var bar_group = create_dom_element('g');
	bar_group.setAttribute('transform', 'translate(40,560)');
	var box_group = create_dom_element('g');
	box_group.setAttribute('transform', 'translate(340,560)');

	// we then add the groups as children of the SVG element
	svg_element.appendChild(point_group);
	svg_element.appendChild(bar_group);
	svg_element.appendChild(box_group);

	// TODO: for each object of `points_data`, create a circle SVG element, set the element's attributes, and add the circle element as a child of `point_group`
	// STRONG HINT: you should implement `create_circle_element` above to create a circle element and populate its attributes
	points_data.forEach(function(point) {
		point_group.appendChild(create_circle_element(point))
	})

	// TODO: for each object of `bars_data`, create a rect SVG element, set the element's attributes, and add the rect element as a child of `rect_group`
	// STRONG HINT: you should implement `create_rect_element` above to create a rect element and populate its attributes
	bars_data.forEach(function(rect) {
		bar_group.appendChild(create_rect_element(rect))
	})

	// (optional UG / required grad) TODO: for each object of `boxes_data`, there exists 5 properties:
	// `translate`: this specifies how much to translate in the x axis -> a group element should be created with this corresponding transformation (see above)
	// `fullrange`: this is an object that contains information for creating a line element
	// `min`: this is an object that contains information for creating a line element
	// `max`: this is an object that contains information for creating a line element
	// `quartiles`: this is an object that contains information for creating a rectangle element
	// `median`: this is an object that contains information for creating a line element
	// You should: create the group element, create an SVG element for the aforementioned lines and rectangle
	// add the line and rectangle elements to the group element (in the order specified above), and finally, add the group element to `box_group`
	boxes_data.forEach(function(box) {
		var group = create_dom_element('g');
		group.setAttribute('transform', `translate(${box.translate}, 0)`);
		group.appendChild(create_rect_element(box.quartiles));
		group.appendChild(create_line_element(box.fullrange));
		group.appendChild(create_line_element(box.min));
		group.appendChild(create_line_element(box.max));
		group.appendChild(create_line_element(box.median));
		box_group.appendChild(group)
	})
}
