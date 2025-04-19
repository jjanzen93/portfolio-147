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
  const width = canvasContainer.width();
  const height = canvasContainer.height();

  resizeCanvas(width, height);
  centerHorz = width / 2;
  centerVert = height / 2;
}

// setup() function is called once when the program starts
function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  let button = createButton("reimagine").mousePressed(() => seed++);
  canvas.parent("canvas-container");
  button.parent("canvas-container");
  // resize canvas is the page is resized

  // create an instance of the class
  myInstance = new MyClass(backgroundColor, availableColors);

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();

  $(document).ready(function () {
    $("#fullscreen").on("click", function () {
      $("body").toggleClass("is-fullscreen");
      resizeScreen(); // Resize the canvas to fit the new fullscreen container
    });
  });

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
  fill(myInstance.backgroundColor);
  rect(0, 0, width, height);
  noStroke();
  randomSeed(seed);
  const shapes = 1000*random()

  // triangles
  let color = Math.floor(random() * myInstance.availableColors.length)
  stroke(myInstance.availableColors[color]);
  print(myInstance.availableColors[color]);
  noFill();
  for (let i = 0; i < shapes; i++) {
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
  for (let i = 0; i < shapes; i++) {
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
  for (let i = 0; i < shapes; i++) {
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
  for (let i = 0; i < shapes; i++) {
    let x = width * random();
    let y = height * random();
    rotate(360*random());
    let scale = getScale(x, y);
    circle(x, y, 25*scale);
  }

}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
}