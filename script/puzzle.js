/**
 * @namespace Contains all of the core Puzzle classes
 */ 
var PUZZLE = {};

/**
 * Creates a new Puzzle Controller
 * @class	Controls all of the Puzzle logic and handles all of the Puzzle events
 * @param	{PuzzleCanvas}	puzzleCanvas	Puzzle canvas used to display Puzzle
 * @param	{Image}			image			Image used within the Puzzle
 * @param	{Number}		numCircles		Number of concentric circles in Puzzle
 */
PUZZLE.PuzzleController = function(puzzleCanvas, image, numCircles) {
	// Constants
	var FULL_ROTATION = (Math.PI * 2);
	var ROTATION_SPEED = 50;

	// Properties
	this.puzzleCanvas = puzzleCanvas;
	this.isDragging = false;
	this.activeCircle = null;
	this.circles = [];

	// Get canvas dimensions
	var canvasWidth = puzzleCanvas.getWidth();
	var canvasHeight = puzzleCanvas.getHeight();

	// Get image dimensions
	var imageWidth = image.width;
	var imageHeight = image.height;
	
	// Use the smallest possible radius to ensure image fits
	var maxRadius = Math.min(canvasWidth, canvasHeight, imageWidth, imageHeight)/2;
		
	// Calculate Puzzle Circle dimensions
	var centerX = canvasWidth/2;
	var centerY = canvasHeight/2;
	
	var radiusDiff = (maxRadius/numCircles);
	
	// Create the Puzzle Circles
	var currRadius = maxRadius;
	for(var i=0; i<numCircles; i++)
	{
		var rotation = Math.random() * FULL_ROTATION;
		this.circles[i] = new PUZZLE.PuzzleCircle(centerX, centerY, currRadius, image, rotation);
		
		currRadius -= radiusDiff;
	}
	
	// Display the Puzzle Circles
	this.draw();
	
	var self = this;
	
	// Event Handler: On Mouse Down
	puzzleCanvas.canvas.addEventListener('mousedown', function(event) {
		var cursorPos = self.puzzleCanvas.getCursorPosition(event);
		
		// Determine the circle that the User clicked
		for(var i=self.circles.length - 1; i>=0; i--)
		{
			if(self.circles[i].isInside(cursorPos.x, cursorPos.y))
			{
				self.activeCircle = self.circles[i];
				self.isDragging = true;
				return;
			}
		}
	}, false);
	
	var lastCursorX = null;
	
	// Event Handler: On Mouse Up
	puzzleCanvas.canvas.addEventListener('mouseup', function(event) {
		// Reset the dragging state
		self.isDragging = false;
		lastCursorX = null;
	}, false);
	
	// Event Handler: On Mouse Move
	puzzleCanvas.canvas.addEventListener('mousemove', function(event) {
		if(!self.isDragging)
		{
			return;
		}

		var cursorPos = self.puzzleCanvas.getCursorPosition(event);
		var cursorX = cursorPos.x;
		var cursorY = cursorPos.y;
		
		// First Mouse Move since Mouse Down, so just the cache cursor position and leave
		if(lastCursorX == null)
		{
			lastCursorX = cursorX;
			return;
		}
		
		// Calculate rotation distance
		var cursorXDiff = cursorX - lastCursorX;
		var rotation = -(cursorXDiff/ROTATION_SPEED);

		// If we're on the upper half of the circle, then we need to do the inverse calculation
		// of the rotation
		if(cursorY < self.activeCircle.y)
		{
			rotation = (FULL_ROTATION) - rotation;
		}
		
		self.rotateCircle(self.activeCircle, rotation);
		
		// Cache the cursor position
		lastCursorX = cursorX;
	}, false);
};

/**
 * Rotates a circle in the Puzzle
 * @param	{PuzzleCircle}	circle		Puzzle circle to rotate
 * @param	{Number}		rotation	Radians of rotation
 */
PUZZLE.PuzzleController.prototype.rotateCircle = function(circle, rotation) {
	circle.rotation += rotation;
	this.draw();
};

/**
 * Draws the Puzzle on the canvas
 */
PUZZLE.PuzzleController.prototype.draw = function() {
	this.puzzleCanvas.clear();

	for(var i=0; i<this.circles.length; i++)
	{
		var circle = this.circles[i];
		this.puzzleCanvas.drawPuzzleCircle(circle);
	}
};

/**
 * Creates a new Puzzle Circle
 * @class	A circle within the Puzzle
 * @param	{Number}	x			Center X-coordinate
 * @param	{Number}	y			Center Y-coordinate
 * @param	{Number}	radius		Radius of circle
 * @param	{Number}	image		Image displayed within circle
 * @param	{Number}	rotation	Radian rotation of Circle
 */
PUZZLE.PuzzleCircle = function(x, y, radius, image, rotation) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.image = image;
	this.rotation = rotation;
};

/**
 * Checks if coordinates are within the boundaries of a circle
 * @param	{Number}	x	X-coordinate
 * @param	{Number}	y	Y-coordinate
 */
PUZZLE.PuzzleCircle.prototype.isInside = function (x, y) {
	var xDist = this.x - x;
	var yDist = this.y - y;
	
	return ((xDist * xDist) + (yDist * yDist)) < (this.radius * this.radius);
};

/**
 * Creates a new Puzzle Canvas
 * @class	A canvas displaying a Puzzle
 * @param	{DOM}	Canvas element
 */
PUZZLE.PuzzleCanvas = function(canvas) {
	this.canvas = canvas;
	this.gfxContext = canvas.getContext('2d');
};

/**
 * Returns the width of the canvas
 * @return	{Number}	Width of the canvas
 */
PUZZLE.PuzzleCanvas.prototype.getWidth = function() {
	return this.canvas.width;
};

/**
 * Returns the height of the canvas
 * @return	{Number}	Height of the canvas
 */
PUZZLE.PuzzleCanvas.prototype.getHeight = function() {
	return this.canvas.height;
};

/**
 * Returns the X, Y coordinates of the User's cursor, within the Canvas
 * @param	{Event}		event	Mouse event
 * @return	{Object}	User's cursor position as an object map with "x" and "y" properties
 */
PUZZLE.PuzzleCanvas.prototype.getCursorPosition = function(event) {
	var cursorPos = UTIL.getCursorPosition(event);
	cursorPos.x -= this.canvas.offsetLeft;
	cursorPos.y -= this.canvas.offsetTop;
	return cursorPos;
};

/**
 * Clears the canvas
 */
PUZZLE.PuzzleCanvas.prototype.clear = function() {
	var canvasWidth = this.getWidth();
	var canvasHeight = this.getHeight();
	
	var context = this.gfxContext;
	
	context.globalCompositeOperation = 'destination-over';
	context.clearRect(0, 0, canvasWidth, canvasHeight);
};

/**
 * Draws a Puzzle Circle
 * @param	puzzleCircle
 */
PUZZLE.PuzzleCanvas.prototype.drawPuzzleCircle = function(puzzleCircle) {
	var context = this.gfxContext;

	// Start composition
	context.save();
	
	context.globalCompositeOperation = 'source-over';
	
	// Move canvas to center or Circle to simplify rotation
	context.translate(puzzleCircle.x, puzzleCircle.y);
	context.rotate(puzzleCircle.rotation);
	
	// Draw the circle
	context.beginPath();
	context.arc(0, 0, puzzleCircle.radius, 0, Math.PI * 2, false);
	context.clip();
	
	// Draw the image
	context.drawImage(puzzleCircle.image,
		-(puzzleCircle.image.width/2),
		-(puzzleCircle.image.height/2));
	
	// End composition
	context.restore();
};

/**
 * @namespace Contains utility functions
 */
var UTIL = {};

/**
 * Returns the X, Y coordinates of the User's cursor, within the browser window
 * @param	{Event}		event	Mouse event
 * @return	{Object}	User's cursor position as an object map with "x" and "y" properties
 * CREDIT: http://answers.oreilly.com/topic/1929-how-to-use-the-canvas-and-draw-elements-in-html5/
 */
UTIL.getCursorPosition = function(event) {
	var x;
	var y;
	
	if (event.pageX || event.pageY)
	{
		x = event.pageX;
		y = event.pageY;
	}
	else
	{
		x = event.clientX + document.body.scrollLeft
				+ document.documentElement.scrollLeft;
		y = event.clientY + document.body.scrollTop
				+ document.documentElement.scrollTop;
	}
	
	return { 'x': x, 'y': y };
};

// Launch the Puzzle when the DOM is ready
window.addEventListener('load', function () {
	var puzzleImage = new Image();
	puzzleImage.onload = function() {
		var canvas = document.getElementById('puzzle-canvas');
		var puzzleCanvas = new PUZZLE.PuzzleCanvas(canvas);
		var puzzle = new PUZZLE.PuzzleController(puzzleCanvas, puzzleImage, 5);
	};
	puzzleImage.src = 'image.jpg';
}, false);