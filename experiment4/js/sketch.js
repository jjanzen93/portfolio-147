// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Sketch One
var s = function( p ) { // p could be any variable name
  let tile_width_step_main; // A width step is half a tile's width
  let tile_height_step_main; // A height step is half a tile's height

  // Global variables. These will mostly be overwritten in setup().
  let tile_rows, tile_columns;
  let camera_offset;
  let camera_velocity;
  let width, height;

  /////////////////////////////
  // Transforms between coordinate systems
  // These are actually slightly weirder than in full 3d...
  /////////////////////////////
  p.worldToScreen = function([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i + camera_x, j + camera_y];
  }

  p.worldToCamera = function([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i, j];
  }

  p.tileRenderingOrder = function(offset) {
    return [offset[1] - offset[0], offset[0] + offset[1]];
  }

  p.screenToWorld = function([screen_x, screen_y], [camera_x, camera_y]) {
    screen_x -= camera_x;
    screen_y -= camera_y;
    screen_x /= tile_width_step_main * 2;
    screen_y /= tile_height_step_main * 2;
    screen_y += 0.5;
    return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
  }

  p.cameraToWorldOffset = function([camera_x, camera_y]) {
    let world_x = camera_x / (tile_width_step_main * 2);
    let world_y = camera_y / (tile_height_step_main * 2);
    return { x: Math.round(world_x), y: Math.round(world_y) };
  }

  p.worldOffsetToCamera = function([world_x, world_y]) {
    let camera_x = world_x * (tile_width_step_main * 2);
    let camera_y = world_y * (tile_height_step_main * 2);
    return new p5.Vector(camera_x, camera_y);
  }

  p.preload = function() {
    if (p.p3_preload) {
      p.p3_preload();
    }
  }

  p.setup = function() {
    let canvas = p.createCanvas(800, 400);
    canvas.parent("canvasContainer1");
    width = canvas.width;
    height = canvas.height;

    camera_offset = new p5.Vector(-width / 2, height / 2);
    camera_velocity = new p5.Vector(0, 0);

    if (p.p3_setup) {
      p.p3_setup();
    }

    let label = p.createP();
    label.html("World key: ");
    label.parent("canvasContainer1");

    let input = p.createInput("xyzzy");
    input.parent(label);
    input.input(() => {
      p.rebuildWorld(input.value());
    });

    p.createP("This is Conway's Game of Life. WASD pans the camera. Clicking spawns or kills a tile. Press '-' to pause time.").parent("canvasContainer1");

    p.rebuildWorld(input.value());
  }

  p.rebuildWorld = function(key) {
    if (p.p3_worldKeyChanged) {
      p.p3_worldKeyChanged(key);
    }
    tile_width_step_main = p.p3_tileWidth ? p.p3_tileWidth() : 32;
    tile_height_step_main = p.p3_tileHeight ? p.p3_tileHeight() : 14.5;
    tile_columns = Math.ceil(width / (tile_width_step_main * 2));
    tile_rows = Math.ceil(height / (tile_height_step_main * 2));
  }

  p.mouseClicked = function() {
    let world_pos = p.screenToWorld(
      [0 - p.mouseX, p.mouseY],
      [camera_offset.x, camera_offset.y]
    );

    if (p.p3_tileClicked) {
      p.p3_tileClicked(world_pos[0], world_pos[1]);
    }
    return false;
  }

  p.keyPressed = function() {
    if (p.key === '-') {
      paused *= -1;
    }
  }

  p.draw = function() {
    // Keyboard controls!
    if (p.keyIsDown(65)) {
      camera_velocity.x -= 1;
    }
    if (p.keyIsDown(68)) {
      camera_velocity.x += 1;
    }
    if (p.keyIsDown(83)) {
      camera_velocity.y -= 1;
    }
    if (p.keyIsDown(87)) {
      camera_velocity.y += 1;
    }

    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
      camera_velocity.setMag(0);
    }

    let world_pos = p.screenToWorld(
      [0 - p.mouseX, p.mouseY],
      [camera_offset.x, camera_offset.y]
    );
    let world_offset = p.cameraToWorldOffset([camera_offset.x, camera_offset.y]);

    p.background(100);

    if (p.p3_drawBefore) {
      p.p3_drawBefore();
    }

    let overdraw = 0.1;

    let y0 = Math.floor((0 - overdraw) * tile_rows);
    let y1 = Math.floor((1 + overdraw) * tile_rows);
    let x0 = Math.floor((0 - overdraw) * tile_columns);
    let x1 = Math.floor((1 + overdraw) * tile_columns);

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        p.eng_drawTile(p.tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
          camera_offset.x,
          camera_offset.y
        ]); // odd row
      }
      for (let x = x0; x < x1; x++) {
        p.eng_drawTile(
          p.tileRenderingOrder([
            x + 0.5 + world_offset.x,
            y + 0.5 - world_offset.y
          ]),
          [camera_offset.x, camera_offset.y]
        ); // even rows are offset horizontally
      }
    }

    p.describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

    if (p.p3_drawAfter) {
      p.p3_drawAfter();
    }
  }

  // Display a discription of the tile at world_x, world_y.
  p.describeMouseTile = function([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = p.worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    p.drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
  }

  p.drawTileDescription = function([world_x, world_y], [screen_x, screen_y]) {
    p.push();
    p.translate(screen_x, screen_y);
    if (p.p3_drawSelectedTile) {
      p.p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    }
    p.pop();
  }

  // Draw a tile, mostly by calling the user's drawing code.
  p.eng_drawTile = function([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = p.worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    p.push();
    p.translate(0 - screen_x, screen_y);
    if (p.p3_drawTile) {
      p.p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    p.pop();
  }


  // ACTUAL CODE STARTS HERE

  // load before program start
  p.p3_preload = function() {}

  // called at program start
  p.p3_setup = function() {}

  let worldSeed;

  // reseeds world
  p.p3_worldKeyChanged = function(key) {
  worldSeed = XXH.h32(key, 0);
  p.noiseSeed(worldSeed);
  p.randomSeed(worldSeed);
  alive = {};
  seen = {};
  gameStarted = false;
  
  // Seed initial alive tiles
  for (let i = -50; i <= 50; i++) {
    for (let j = -50; j<= 50; j++) {
      let hash = XXH.h32("tile:" + [i, j], worldSeed);
      if (hash % 8 == 0) {
        alive[[i, j]] = true;
      }
    }
  }
  
  gameStarted = true;
  }

  // gets tile width
  p.p3_tileWidth = function() {
  return 32;
  }

  // gets tile height
  p.p3_tileHeight = function() {
  return 16;
  }

  let [tileWidth, tileHeight] = [p.p3_tileWidth(), p.p3_tileHeight()];

  // tracks living tiles
  let alive = {};

  // tracks previously loaded tiles
  let seen = {};

  // counts ticks
  let tickCount = 0;

  // paused = 1, playing = -1
  let paused = -1;

  // checks when the seed has begun to ensure living tiles spawn only once
  let gameStarted = false;

  // runs when a tile is clicked
  p.p3_tileClicked = function(i, j) {
  let key = [i, j];
  alive[key] = alive[key] ? false : true;
  p.fill(alive[key] ? 0 : 255);
  
  p.push();
  p.beginShape();
  p.vertex(-tileWidth, 0);
  p.vertex(0, tileHeight);
  p.vertex(tileWidth, 0);
  p.vertex(0, -tileHeight);
  p.endShape(p.CLOSE);
  p.pop();
  }

  // draw before all the tiles
  p.p3_drawBefore = function() {
  if (paused < 0) {
    tickCount++;
    if (tickCount % 20 == 0) {
      p.advanceGame();
    }
  }
  }

  // draw a tile at a given location
  p.p3_drawTile = function(i, j) {
  p.stroke(140, 140, 140);
  let key = [i, j];
  if (!(key in seen)) {
    seen[key] = true;
    if (XXH.h32("tile:" + key, worldSeed) % 8 == 0) {
      alive[key] = true;
    }
  }
  p.fill(alive[key] ? 0 : 255);
  
  p.push();
  p.beginShape();
  p.vertex(-tileWidth, 0);
  p.vertex(0, tileHeight);
  p.vertex(tileWidth, 0);
  p.vertex(0, -tileHeight);
  p.endShape(p.CLOSE);
  p.pop();
  }

  // highlight tile and display coordinate
  p.p3_drawSelectedTile = function(i, j) {
  p.noFill();
  p.stroke(0, 255, 0, 128);

  p.beginShape();
  p.vertex(-tileWidth, 0);
  p.vertex(0, tileHeight);
  p.vertex(tileWidth, 0);
  p.vertex(0, -tileHeight);
  p.endShape(p.CLOSE);

  p.noStroke();
  p.fill(0);
  p.text("tile " + [i, j], 0, 0);
  }

  // draw after tiles
  p.p3_drawAfter = function() {}

  p.adjustBrightness = function(c, value) {
    c.setRed(p.red(c)*value)
    c.setBlue(p.blue(c)*value)
    c.setGreen(p.green(c)*value)
    return c
  }

  p.advanceGame = function() {
  let neighborCounts = {};
  
  for (let key in alive) {
    if (!alive[key]) continue;
    let [i, j] = key.split(',').map(Number);
    
    for (let di = -1; di <= 1; di++) {
      for (let dj = -1; dj <= 1; dj++) {
        if (di == 0 && dj == 0) continue;
        let ni = i + di;
        let nj = j + dj;
        let nKey = [ni, nj];
        neighborCounts[nKey] = (neighborCounts[nKey] || 0) + 1;
      }
    }
  }
  
  let newAlive = {};
  
  for (let key in neighborCounts) {
    let count = neighborCounts[key];
    let aliveNow = alive[key] || false;
    
    if (aliveNow && (count == 2 || count == 3)) {
      newAlive[key] = true;
    } else if (!aliveNow && count == 3) {
      newAlive[key] = true;
    }
  }
  
  alive = newAlive;
  }

};
var myp5 = new p5(s, 'c1');



// Sketch Two
var t = function( p ) { 
  let tile_width_step_main; // A width step is half a tile's width
  let tile_height_step_main; // A height step is half a tile's height

  // Global variables. These will mostly be overwritten in setup().
  let tile_rows, tile_columns;
  let camera_offset;
  let camera_velocity;
  let width, height;

  /////////////////////////////
  // Transforms between coordinate systems
  // These are actually slightly weirder than in full 3d...
  /////////////////////////////
  p.worldToScreen = function([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i + camera_x, j + camera_y];
  }

  p.worldToCamera = function([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i, j];
  }

  p.tileRenderingOrder = function(offset) {
    return [offset[1] - offset[0], offset[0] + offset[1]];
  }

  p.screenToWorld = function([screen_x, screen_y], [camera_x, camera_y]) {
    screen_x -= camera_x;
    screen_y -= camera_y;
    screen_x /= tile_width_step_main * 2;
    screen_y /= tile_height_step_main * 2;
    screen_y += 0.5;
    return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
  }

  p.cameraToWorldOffset = function([camera_x, camera_y]) {
    let world_x = camera_x / (tile_width_step_main * 2);
    let world_y = camera_y / (tile_height_step_main * 2);
    return { x: Math.round(world_x), y: Math.round(world_y) };
  }

  p.worldOffsetToCamera = function([world_x, world_y]) {
    let camera_x = world_x * (tile_width_step_main * 2);
    let camera_y = world_y * (tile_height_step_main * 2);
    return new p5.Vector(camera_x, camera_y);
  }

  p.preload = function() {
    if (p.p3_preload) {
      p.p3_preload();
    }
  }

    p.setup = function() {
    let canvas = p.createCanvas(800, 400);
    canvas.parent("canvasContainer1");
    width = canvas.width;
    height = canvas.height;

    camera_offset = new p5.Vector(-width / 2, height / 2);
    camera_velocity = new p5.Vector(0, 0);

    if (p.p3_setup) {
      p.p3_setup();
    }

    let label = p.createP();
    label.html("World key: ");
    label.parent("canvasContainer1");

    let input = p.createInput("xyzzy");
    input.parent(label);
    input.input(() => {
      p.rebuildWorld(input.value());
    });

    p.createP("Clear your mind. WASD pans the camera. Clicking a tile makes a ripple, which clears the rocks. Press '-' to pause time.").parent("canvasContainer1");

    p.rebuildWorld(input.value());
  }

  p.rebuildWorld = function(key) {
    if (p.p3_worldKeyChanged) {
      p.p3_worldKeyChanged(key);
    }
    tile_width_step_main = p.p3_tileWidth ? p.p3_tileWidth() : 32;
    tile_height_step_main = p.p3_tileHeight ? p.p3_tileHeight() : 14.5;
    tile_columns = Math.ceil(width / (tile_width_step_main * 2));
    tile_rows = Math.ceil(height / (tile_height_step_main * 2));
  }

  p.mouseClicked = function() {
    let world_pos = p.screenToWorld(
      [0 - p.mouseX, p.mouseY],
      [camera_offset.x, camera_offset.y]
    );

    if (p.p3_tileClicked) {
      p.p3_tileClicked(world_pos[0], world_pos[1]);
    }
    return false;
  }

  p.keyPressed = function() {
    if (p.key === '-') {
      paused *= -1;
    }
  }

  p.draw = function() {
    // Keyboard controls!
    if (p.keyIsDown(65)) {
      camera_velocity.x -= 1;
    }
    if (p.keyIsDown(68)) {
      camera_velocity.x += 1;
    }
    if (p.keyIsDown(83)) {
      camera_velocity.y -= 1;
    }
    if (p.keyIsDown(87)) {
      camera_velocity.y += 1;
    }

    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
      camera_velocity.setMag(0);
    }

    let world_pos = p.screenToWorld(
      [0 - p.mouseX, p.mouseY],
      [camera_offset.x, camera_offset.y]
    );
    let world_offset = p.cameraToWorldOffset([camera_offset.x, camera_offset.y]);

    p.background(100);

    if (p.p3_drawBefore) {
      p.p3_drawBefore();
    }

    let overdraw = 0.1;

    let y0 = Math.floor((0 - overdraw) * tile_rows);
    let y1 = Math.floor((1 + overdraw) * tile_rows);
    let x0 = Math.floor((0 - overdraw) * tile_columns);
    let x1 = Math.floor((1 + overdraw) * tile_columns);

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        p.eng_drawTile(p.tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
          camera_offset.x,
          camera_offset.y
        ]); // odd row
      }
      for (let x = x0; x < x1; x++) {
        p.eng_drawTile(
          p.tileRenderingOrder([
            x + 0.5 + world_offset.x,
            y + 0.5 - world_offset.y
          ]),
          [camera_offset.x, camera_offset.y]
        ); // even rows are offset horizontally
      }
    }

    p.describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

    if (p.p3_drawAfter) {
      p.p3_drawAfter();
    }
  }

  // Display a discription of the tile at world_x, world_y.
  p.describeMouseTile = function([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = p.worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    p.drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
  }

  p.drawTileDescription = function([world_x, world_y], [screen_x, screen_y]) {
    p.push();
    p.translate(screen_x, screen_y);
    if (p.p3_drawSelectedTile) {
      p.p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    }
    p.pop();
  }

  // Draw a tile, mostly by calling the user's drawing code.
  p.eng_drawTile = function([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = p.worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    p.push();
    p.translate(0 - screen_x, screen_y);
    if (p.p3_drawTile) {
      p.p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    p.pop();
  }

  // ACTUAL CODE STARTS HERE

  // load before program start
  p.p3_preload = function() {}

  // called at program start
  p.p3_setup = function() {}

  let worldSeed;

  // reseeds world
  p.p3_worldKeyChanged = function(key) {
    worldSeed = XXH.h32(key, 0);
    p.noiseSeed(worldSeed);
    p.randomSeed(worldSeed);
    seen = {};
    rippleCount = {};
    rockMap = new Map();
    origins = []
  }

  // gets tile width
  p.p3_tileWidth = function() {
    return 32;
  }

  // gets tile height
  p.p3_tileHeight = function() {
    return 16;
  }

  let [tileWidth, tileHeight] = [p.p3_tileWidth(), p.p3_tileHeight()];

  // list of origin tiles
  let origins = [];

  // tiles keyed to how many ripples are occurring there
  let rippleCount = {};

  // tracks rocks
  let rockMap;

  // tracks previously loaded tiles
  let seen = {};

  // counts ticks
  let tickCount = 0;

  // paused = 1, playing = -1
  let paused = -1;


  let audio = new Audio('../aud/drop.mp3');

  // runs when a tile is clicked
  p.p3_tileClicked = function(i, j) {
    origins.push({ origin: [i, j], startTick: tickCount });
    audio.play();
  }

  // draw before all the tiles
  p.p3_drawBefore = function() {
    if (paused < 0) {
      tickCount++;
    }
    p.ripple();

  }

  // draw a tile at a given location
  p.p3_drawTile = function(i, j) {
    p.stroke(140, 140, 140, 0);
    let key = [i, j];
    if (!(key in seen)) {
      seen[key] = true;
    }

    let count = rippleCount[`${i},${j}`] || 0;
    let rock = p.isRock(i, j);
    let currentColor = rock ? p.color(80, 80, 80) : p.color(100, 100, 255);
    p.fill(currentColor);

    if (!rock && count >= 1) {
      currentColor = p.color(120, 120, 255);
      p.fill(currentColor);
      p.stroke(100, 100, 100, 0);
      p.beginShape();
      p.vertex(-tileWidth, 0-(10));
      p.vertex(0, tileHeight-(10));
      p.vertex(tileWidth, 0-(10));
      p.vertex(0, -tileHeight-(10));
      p.endShape(p.CLOSE);
      let originalColor = currentColor;
      currentColor = p.adjustBrightness(currentColor, .9);
      p.fill(currentColor);
      p.beginShape();
      p.vertex(tileWidth, -10);
      p.vertex(tileWidth, 0);
      p.vertex(0, tileHeight);
      p.vertex(0, tileHeight-10);
      p.endShape(p.CLOSE);
      p.beginShape();
      p.vertex(-tileWidth, -10);
      p.vertex(-tileWidth, 0);
      p.vertex(0, tileHeight);
      p.vertex(0, tileHeight-10);
      p.endShape(p.CLOSE);
      currentColor = originalColor;
    } else if (!rock) {
      p.beginShape();
      p.vertex(-tileWidth, 0);
      p.vertex(0, tileHeight);
      p.vertex(tileWidth, 0);
      p.vertex(0, -tileHeight);
      p.endShape(p.CLOSE);
    } else {
      let rockHeight = rockMap.get(`${i},${j}`) || 0;
      if (rockHeight <= 0) return;
      currentColor = p.color(90, 90, 90);
      p.fill(currentColor);
      p.stroke(100, 100, 100, 0);
      p.beginShape();
      p.vertex(-tileWidth, -rockHeight);
      p.vertex(0, tileHeight-rockHeight);
      p.vertex(tileWidth, -rockHeight);
      p.vertex(0, -tileHeight-rockHeight);
      p.endShape(p.CLOSE);
      let originalColor = currentColor;
      currentColor = p.adjustBrightness(currentColor, .9);
      p.fill(currentColor);
      p.beginShape();
      p.vertex(tileWidth, -rockHeight);
      p.vertex(tileWidth, 0);
      p.vertex(0, tileHeight);
      p.vertex(0, tileHeight-rockHeight);
      p.endShape(p.CLOSE);
      p.beginShape();
      p.vertex(-tileWidth, -rockHeight);
      p.vertex(-tileWidth, 0);
      p.vertex(0, tileHeight);
      p.vertex(0, tileHeight-rockHeight);
      p.endShape(p.CLOSE);
      currentColor = originalColor;
    }
  }

  // highlight tile and display coordinate
  p.p3_drawSelectedTile = function(i, j) {
    p.noFill();
    p.stroke(0, 255, 0, 128);

    p.beginShape();
    p.vertex(-tileWidth, 0);
    p.vertex(0, tileHeight);
    p.vertex(tileWidth, 0);
    p.vertex(0, -tileHeight);
    p.endShape(p.CLOSE);

    p.noStroke();
    p.fill(0);
    p.text("tile " + [i, j], 0, 0);
  }

  // draw after tiles
  p.p3_drawAfter = function() {}

  // multiplies RGB value of given color by given value. >1 brightens, <1 darkens
  p.adjustBrightness = function(c, value) {
    c.setRed(p.red(c)*value)
    c.setBlue(p.blue(c)*value)
    c.setGreen(p.green(c)*value)
    return c
  }

  // creates the origin rock tile that can be spread from.
  p.isRockOrigin = function(i, j) {
    const key = `${i},${j}`;
    const hash = XXH.h32("tile:" + key, worldSeed);
    return (hash % 50) === 0;
  }


  p.isRock = function(i, j) {
    const key = `${i},${j}`;
    if (rockMap.has(key)) return rockMap.get(key) > 0;

    if (p.isRockOrigin(i, j)) {
      rockMap.set(key, 20 + (XXH.h32("height:" + key, worldSeed) % 2) * 20);
      p.spreadRock(i, j);
      return true;
    }

    rockMap.set(key, 0);
    return false;
  }

  p.spreadRock = function(i, j) {
    const directions = [
      [0, -1],
      [0, 1],
      [1, 0],
      [-1, 0],
    ];

    let q = [[i, j]];

    while (q.length > 0) {
      const [x,y] = q.pop();

      for (let [dx, dy] of directions) {
        const nx = x+dx;
        const ny = y+dy;
        const neighborKey = `${nx},${ny}`;
        if (rockMap.has(neighborKey)) continue;

        const spreadHash = XXH.h32("spread:" + neighborKey, worldSeed);
        const willSpread = (spreadHash % 100) < 25; // given neighbor has 15% chance to spawn rock

        if (willSpread) {
          rockMap.set(neighborKey, 20 + (XXH.h32("height:" + neighborKey, worldSeed) % 2) * 10);
          q.push([nx, ny]);
        } else {
          rockMap.set(neighborKey, 0);
        }
      }
    }
  }

  // advances ripple
  p.ripple = function() {

    for (let key in rippleCount) {
      if (rockMap.has(key) && rockMap.get(key) > 0) {
        let newHeight = rockMap.get(key) - 10;
        rockMap.set(key, Math.max(newHeight, 0));
      }
    }

    rippleCount = {};

    for (let { origin, startTick } of origins) {
      let age = Math.floor((tickCount - startTick) / 10);
      if (age < 0 || age > 10) continue;

      let [ox, oy] = origin;

      let radius = age;
      let fuzz = 0.6; // adjust for thickness/smoothness

      for (let dx = -radius - 1; dx <= radius + 1; dx++) {
        for (let dy = -radius - 1; dy <= radius + 1; dy++) {
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= radius - fuzz && dist <= radius + fuzz) {
            let x = ox + dx;
            let y = oy + dy;
            let key = `${x},${y}`;
            if (!rippleCount[key]) {
              rippleCount[key] = 1;
            }
          }
        }
      }
    }

  }

};
var myp5 = new p5(t, 'c2');



// Sketch Three
var u = function( p ) { // p could be any variable name


  let tile_width_step_main; // A width step is half a tile's width
  let tile_height_step_main; // A height step is half a tile's height

  // Global variables. These will mostly be overwritten in setup().
  let tile_rows, tile_columns;
  let camera_offset;
  let camera_velocity;
  let width, height;

  /////////////////////////////
  // Transforms between coordinate systems
  // These are actually slightly weirder than in full 3d...
  /////////////////////////////
  p.worldToScreen = function([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i + camera_x, j + camera_y];
  }

  p.worldToCamera = function([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i, j];
  }

  p.tileRenderingOrder = function(offset) {
    return [offset[1] - offset[0], offset[0] + offset[1]];
  }

  p.screenToWorld = function([screen_x, screen_y], [camera_x, camera_y]) {
    screen_x -= camera_x;
    screen_y -= camera_y;
    screen_x /= tile_width_step_main * 2;
    screen_y /= tile_height_step_main * 2;
    screen_y += 0.5;
    return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
  }

  p.cameraToWorldOffset = function([camera_x, camera_y]) {
    let world_x = camera_x / (tile_width_step_main * 2);
    let world_y = camera_y / (tile_height_step_main * 2);
    return { x: Math.round(world_x), y: Math.round(world_y) };
  }

  p.worldOffsetToCamera = function([world_x, world_y]) {
    let camera_x = world_x * (tile_width_step_main * 2);
    let camera_y = world_y * (tile_height_step_main * 2);
    return new p5.Vector(camera_x, camera_y);
  }

  p.preload = function() {
    if (p.p3_preload) {
      p.p3_preload();
    }
  }

  p.setup = function() {
    let canvas = p.createCanvas(800, 400);
    canvas.parent("canvasContainer1");
    width = canvas.width;
    height = canvas.height;

    camera_offset = new p5.Vector(-width / 2, height / 2);
    camera_velocity = new p5.Vector(0, 0);

    if (p.p3_setup) {
      p.p3_setup();
    }

    let label = p.createP();
    label.html("World key: ");
    label.parent("canvasContainer1");

    let input = p.createInput("xyzzy");
    input.parent(label);
    input.input(() => {
      p.rebuildWorld(input.value());
    });

    p.createP("Cut the clouds. WASD pans the camera.").parent("canvasContainer1");

    p.rebuildWorld(input.value());
  }

  p.rebuildWorld = function(key) {
    if (p.p3_worldKeyChanged) {
      p.p3_worldKeyChanged(key);
    }
    tile_width_step_main = p.p3_tileWidth ? p.p3_tileWidth() : 32;
    tile_height_step_main = p.p3_tileHeight ? p.p3_tileHeight() : 14.5;
    tile_columns = Math.ceil(width / (tile_width_step_main * 2));
    tile_rows = Math.ceil(height / (tile_height_step_main * 2));
  }

  p.mouseClicked = function() {
    let world_pos = p.screenToWorld(
      [0 - p.mouseX, p.mouseY],
      [camera_offset.x, camera_offset.y]
    );

    if (p.p3_tileClicked) {
      p.p3_tileClicked(world_pos[0], world_pos[1]);
    }
    return false;
  }

  p.keyPressed = function() {
    if (p.key === '-') {
      paused *= -1;
    }
  }

  p.draw = function() {
    // Keyboard controls!
    if (p.keyIsDown(65)) {
      camera_velocity.x -= 1;
    }
    if (p.keyIsDown(68)) {
      camera_velocity.x += 1;
    }
    if (p.keyIsDown(83)) {
      camera_velocity.y -= 1;
    }
    if (p.keyIsDown(87)) {
      camera_velocity.y += 1;
    }

    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
      camera_velocity.setMag(0);
    }

    let world_pos = p.screenToWorld(
      [0 - p.mouseX, p.mouseY],
      [camera_offset.x, camera_offset.y]
    );
    let world_offset = p.cameraToWorldOffset([camera_offset.x, camera_offset.y]);

    p.background(100);

    if (p.p3_drawBefore) {
      p.p3_drawBefore();
    }

    let overdraw = 0.1;

    let y0 = Math.floor((0 - overdraw) * tile_rows);
    let y1 = Math.floor((1 + overdraw) * tile_rows);
    let x0 = Math.floor((0 - overdraw) * tile_columns);
    let x1 = Math.floor((1 + overdraw) * tile_columns);

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        p.eng_drawTile(p.tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
          camera_offset.x,
          camera_offset.y
        ]); // odd row
      }
      for (let x = x0; x < x1; x++) {
        p.eng_drawTile(
          p.tileRenderingOrder([
            x + 0.5 + world_offset.x,
            y + 0.5 - world_offset.y
          ]),
          [camera_offset.x, camera_offset.y]
        ); // even rows are offset horizontally
      }
    }

    p.describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

    if (p.p3_drawAfter) {
      p.p3_drawAfter();
    }
  }

  // Display a discription of the tile at world_x, world_y.
  p.describeMouseTile = function([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = p.worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    p.drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
  }

  p.drawTileDescription = function([world_x, world_y], [screen_x, screen_y]) {
    p.push();
    p.translate(screen_x, screen_y);
    if (p.p3_drawSelectedTile) {
      p.p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    }
    p.pop();
  }

  // Draw a tile, mostly by calling the user's drawing code.
  p.eng_drawTile = function([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = p.worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    p.push();
    p.translate(0 - screen_x, screen_y);
    if (p.p3_drawTile) {
      p.p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    p.pop();
  }

  // ACTUAL CODE STARTS HERE

  // load before program start
  p.p3_preload = function() {}

  // called at program start
  p.p3_setup = function() {
    
  }

  let worldSeed;

  // reseeds world
  p.p3_worldKeyChanged = function(key) {
  worldSeed = XXH.h32(key, 0);
  p.noiseSeed(worldSeed);
  p.randomSeed(worldSeed);
  seen = {};
  cloudMap = new Map();
  }

  // gets tile width
  p.p3_tileWidth = function() {
  return 32;
  }

  // gets tile height
  p.p3_tileHeight = function() {
  return 16;
  }

  let [tileWidth, tileHeight] = [p.p3_tileWidth(), p.p3_tileHeight()];

  // tracks previously loaded tiles
  let seen = {};

  // tracks cloud locations
  let cloudMap = new Map();

  // counts ticks
  let tickCount = 0;

  // paused = 1, playing = -1
  let paused = -1;

  // runs when a tile is clicked
  p.p3_tileClicked = function(i, j) {
  let key = [i, j];
  p.push();
  p.beginShape();
  p.vertex(-tileWidth, 0);
  p.vertex(0, tileHeight);
  p.vertex(tileWidth, 0);
  p.vertex(0, -tileHeight);
  p.endShape(p.CLOSE);
  p.pop();
  }

  // draw before all the tiles
  p.p3_drawBefore = function() {
  if (paused < 0) {
    tickCount++;
  }
  }

  // draw a tile at a given location
  p.p3_drawTile = function(i, j) {
  camera_velocity.x += .00003;
  camera_velocity.y -= .00003;
  let n = p.noise((i+50000) * .1, (j+50000)*.1);
  let isCloud = true;
  
  if (!cloudMap.has(`${i},${j}`)) {
    if (n < .2) {
      cloudMap.set(`${i},${j}`, 240);
    } else if (n < .3) {
      cloudMap.set(`${i},${j}`, 200);
    } else if (n < .4) {
      cloudMap.set(`${i},${j}`, 160);
    } else {
      isCloud = false;
    }
  }
  let opacity;
  if (isCloud) {
    opacity = cloudMap.get(`${i},${j}`);
  } else {
    opacity = 0;
  }
  p.fill(125, 125, 255);
  p.stroke(125, 125, 255)
  
  p.push();
  p.beginShape();
  p.vertex(-tileWidth, 0);
  p.vertex(0, tileHeight);
  p.vertex(tileWidth, 0);
  p.vertex(0, -tileHeight);
  p.endShape(p.CLOSE);
  p.pop();
  
  p.fill(255, 255, 255, opacity);
  p.stroke(255, 255, 255, opacity)
  
  p.push();
  p.beginShape();
  p.vertex(-tileWidth, 0);
  p.vertex(0, tileHeight);
  p.vertex(tileWidth, 0);
  p.vertex(0, -tileHeight);
  p.endShape(p.CLOSE);
  p.pop();
  }

  // highlight tile and display coordinate
  p.p3_drawSelectedTile = function(i, j) {
    if (cloudMap.has(`${i},${j}`)) cloudMap.set(`${i},${j}`, 0);
    let key = `${i-1},${j}`
    if (cloudMap.has(key)) {
      if (cloudMap.get(key) != 0) {
        cloudMap.set(key, 160);
      }
    }
    key = `${i+1},${j}`
    if (cloudMap.has(key)) {
      if (cloudMap.get(key) != 0) {
        cloudMap.set(key, 160);
      }
    }
    key = `${i},${j-1}`
    if (cloudMap.has(key)) {
      if (cloudMap.get(key) != 0) {
        cloudMap.set(key, 160);
      }
    }
    key = `${i},${j+1}`
    if (cloudMap.has(key)) {
      if (cloudMap.get(key) != 0) {
        cloudMap.set(key, 160);
      }
    }
  }

  // draw after tiles
  p.p3_drawAfter = function() {}

  p.adjustBrightness = function(c, value) {
    c.setRed(p.red(c)*value)
    c.setBlue(p.blue(c)*value)
    c.setGreen(p.green(c)*value)
    return c
  }

};
var myp5 = new p5(u, 'c3');
