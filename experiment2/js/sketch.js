// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const backgroundColor = "#060F17";
const availableColors = ["#CF6A97", "#5AA4DE", "#D9AE86", "#C6CDD1"]

// Globals
let myInstance;
let canvasContainer;
let seed = 0;
var centerHorz, centerVert;

class MyClass {
    constructor(backgroundColor, availableColors) {
        this.backgroundColor = backgroundColor;
        this.availableColors = availableColors;
    }

    myMethod() {
        // code to run when method is called
    }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

// setup() function is called once when the program starts
function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  // resize canvas is the page is resized

  // create an instance of the class
  myInstance = new MyClass("backgroundColor", "availableColors");

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();
}

// star function taken from p5.js examples
function star(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// shift shape size with mouse position
function getScale(x, y) {
  let d = dist(x, y, mouseX, mouseY);
  let maxDist = dist(0, 0, width, height);
  return map(d, 150, maxDist, 1, 0);
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  background(220);    
  // call a method on the instance
  myInstance.myMethod();

  // Set up rotation for the rectangle
  push(); // Save the current drawing context
  translate(centerHorz, centerVert); // Move the origin to the rectangle's center
  rotate(frameCount / 100.0); // Rotate by frameCount to animate the rotation
  fill(myInstance.backgroundColor);
  noStroke();
  rect(-125, -125, 250, 250); // Draw the rectangle centered on the new origin
  pop(); // Restore the original drawing context
  randomSeed(seed);
  const shapes = 1000*random()

  // triangles
  let color = Math.floor(random() * myInstance.availableColors.length)
  stroke(myInstance.availableColors[color]);
  for (let i = 0; i < shps; i++) {
    let x = width * random();
    let y = height * random();
    rotate(360*random());
    let scale = getScale(x, y);
    triangle(x, y , x - 35*scale, y, x, y - 20*scale);
  }
  
  // squares
  color++;
  if (color == myInstance.availableColors.length) {
    color = 0;
  }
  stroke(myInstance.availableColors[color]);
  for (let i = 0; i < shps; i++) {
    let x = width * random();
    let y = height * random();
    rotate(360*random());
    let scale = getScale(x, y);
    square(x, y, 25*scale);
  }
  
  // stars
  color++;
  if (color == myInstance.availableColors.length) {
    color = 0;
  }
  stroke(myInstance.availableColors[color]);
  for (let i = 0; i < shps; i++) {
    let x = width * random();
    let y = height * random();
    rotate(360*random());
    let scale = getScale(x, y);
    star(x, y, 5*scale, 12*scale, 5);
  }
  
  // circles
  color++;
  if (color == myInstance.availableColors.length) {
    color = 0;
  }
  stroke(myInstance.availableColors[color]);
  for (let i = 0; i < shps; i++) {
    let x = width * random();
    let y = height * random();
    rotate(360*random());
    let scale = getScale(x, y);
    circle(x, y, 25*scale);
  }

  // The text is not affected by the translate and rotate
  fill(255);
  textStyle(BOLD);
  textSize(140);
  text("p5*", centerHorz - 105, centerVert + 40);

}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
}