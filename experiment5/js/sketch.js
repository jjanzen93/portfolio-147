// sketch.js - purpose and description here
// Author: Your Name
// Date:

/* exported preload, setup, draw */
/* global memory, dropper, restart, rate, slider, activeScore, bestScore, fpsCounter */
/* global getInspirations, initDesign, renderDesign, mutateDesign */

let bestDesign;
let currentDesign;
let currentScore;
let currentInspiration;
let currentCanvas;
let currentInspirationPixels;
let annealProgress = -1;
let annealStartTime = 0;
let annealDuration = 30000;

function preload() {
  

  let allInspirations = getInspirations();

  for (let i = 0; i < allInspirations.length; i++) {
    let insp = allInspirations[i];
    insp.image = loadImage(insp.assetUrl);
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = insp.name;
    dropper.appendChild(option);
  }
  dropper.onchange = e => inspirationChanged(allInspirations[e.target.value]);
  currentInspiration = allInspirations[0];

  restart.onclick = () =>
    inspirationChanged(allInspirations[dropper.value]);
}

function inspirationChanged(nextInspiration) {
  currentInspiration = nextInspiration;
  currentDesign = undefined;
  memory.innerHTML = "";
  setup();
}

function startAnnealing() {
  annealDuration = parseFloat(document.getElementById("annealDurationInput").value) * 1000;
  annealStartTime = millis();
  annealProgress = 0;
}

function setup() {
  let designW = currentInspiration.image.width / 4;
  let designH = currentInspiration.image.height / 4;
  currentCanvas = createCanvas(designW, designH);
  currentCanvas.parent(document.getElementById("active"));
  let refGraphics = createGraphics(designW, designH);
  refGraphics.image(currentInspiration.image, 0, 0, designW, designH);
  image(refGraphics, 0, 0);
  loadPixels();
  currentInspirationPixels = [...pixels];

  const referenceEl = document.getElementById("reference");
  referenceEl.innerHTML = "";
  const previewImg = document.createElement("img");
  previewImg.src = refGraphics.canvas.toDataURL();
  previewImg.width = designW;
  previewImg.height = designH;
  referenceEl.appendChild(previewImg);

  currentScore = Number.NEGATIVE_INFINITY;
  currentDesign = initDesign(currentInspiration);
  bestDesign = currentDesign;

  randomSeed(0);
  renderDesign(currentDesign, currentInspiration);
  currentScore = evaluate();
  bestScore.innerHTML = currentScore;
}

function evaluate() {
  loadPixels();

  let error = 0;
  let n = pixels.length;
  
  for (let i = 0; i < n; i++) {
    error += sq(pixels[i] - currentInspirationPixels[i]);
  }
  return 1/(1+error/n);
}



function memorialize() {
  let url = currentCanvas.canvas.toDataURL();

  let img = document.createElement("img");
  img.classList.add("memory");
  img.src = url;
  img.width = width;
  img.heigh = height;
  img.title = currentScore;

  document.getElementById("best").innerHTML = "";
  document.getElementById("best").appendChild(img.cloneNode());

  img.width = width / 2;
  img.height = height / 2;

  memory.insertBefore(img, memory.firstChild);

  if (memory.childNodes.length > memory.dataset.maxItems) {
    memory.removeChild(memory.lastChild);
  }
}

let mutationCount = 0;

function draw() {
  
  if(!currentDesign) {
    return;
  }
  randomSeed(mutationCount++);
  currentDesign = JSON.parse(JSON.stringify(bestDesign));
  let mutationRate;
  if (annealProgress >= 0) {
    let elapsed = millis() - annealStartTime;
    if (elapsed >= annealDuration) {
      annealProgress = -1;
      mutationRate = 0;
    } else {
      mutationRate = map(elapsed, 0, annealDuration, 1.0, 0.0);
    }
    slider.value = nf(mutationRate * 100, 0, 2);
  } else {
    mutationRate = slider.value / 100.0;
  }
  rate.innerHTML = nf(mutationRate * 100, 0, 2);
  mutateDesign(currentDesign, currentInspiration, mutationRate);
  
  randomSeed(0);
  renderDesign(currentDesign, currentInspiration);
  let nextScore = evaluate();
  activeScore.innerHTML = nextScore;
  if (nextScore > currentScore) {
    currentScore = nextScore;
    bestDesign = currentDesign;
    memorialize();
    bestScore.innerHTML = currentScore;
  }
  
  fpsCounter.innerHTML = Math.round(frameRate());
}


/* exported getInspirations, initDesign, renderDesign, mutateDesign */


function getInspirations() {
  return [
    {
      name: "Helter Skelter", 
      assetUrl: "../img/shelter.jpg",
      credit: "Helter Skelter, Tony Sellen, 2019"
    },
    {
      name: "Sunflower", 
      assetUrl: "../img/sunflower.jpg",
      credit: "Sunflower in Black and White, Endre Balogh, 2011"
    },
    {
      name: "Cracked Desert", 
      assetUrl: "../img/desert.png",
      credit: "Untitled, Sarah Marino"
    },
  ];
}

function initDesign(inspiration) {
  resizeCanvas(inspiration.image.width/4, inspiration.image.height/4);
  let design = {
    width: inspiration.image.width/4,
    height: inspiration.image.height/4,
    shapes: [],
  }
  const numShapes = 2000
  for (let i = 0; i < numShapes-1; i++) {
    let cur_shape = {
      x: random(0, design.width),
      y: random(0, design.height),
      wdt: random(0, design.width/8),
      hgt: random(0, design.height/8),
      col: random(255),
      opc: random(255),
      rot: random(0, 360),
    };
    design.shapes.push(cur_shape);
  }
  return design;
}

function renderDesign(design, inspiration) {
  noStroke();
  background(0);
  for (let shape of design.shapes) {
    push();
    translate(shape.x, shape.y);
    rotate(radians(shape.rot));
    fill(shape.col, shape.opc);
    triangle(0, -shape.hgt/2, shape.wdt/2, shape.hgt/2, -shape.wdt/2, shape.hgt/2);
    pop();
  }
}

function mutateDesign(design, inspiration, rate) {
  for (let shape of design.shapes) {
    shape.x = mut(shape.x, 0, design.width, rate);
    shape.y = mut(shape.y, 0, design.height, rate);
    shape.wdt = mut(shape.wdt, 0, design.width/4, rate);
    shape.hgt = mut(shape.hgt, 0, design.height/4, rate);
    shape.col = mut(shape.col, 0, 255, rate);
    shape.opc = mut(shape.opc, 0, 255, rate);
    shape.rot = mut(shape.rot, 0, 360, rate);
  }
}

function mut(num, min, max, rate) {
  return constrain(randomGaussian(num, (rate* (max - min)) / 20), min, max);
}

