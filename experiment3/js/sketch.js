// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Sketch One
var s = function( p ) { // p could be any variable name
  let seed = 0;
  let tilesetImage;
  let currentGrid = [];
  let numRows, numCols;
  let hoverRow = -1;
  let hoverCol = -1;
  let bubbleFrame = 0;
  let bubbleTick = 0;
  let animatingBubbles = {};
  const bubbleFrames = 4;
  const bubbleSpeed = 6;
  let animatingDirt = {};
  let hoveredDirt = {};
  const dirtFrames = 4;
  const dirtSpeed = 4;
  const tileSize = 16;
  
  p.preload = function() {
    tilesetImage = p.loadImage(
      "../../img/25101045-29e2-407a-894c-e0243cd8c7c6_tilesetP8 (1).png"
    );
  };

  p.reseed = function() {
    seed = (seed | 0) + 1109;
    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.select("#seedReport").html("seed " + seed);
    p.regenerateGrid();
  };

  p.regenerateGrid = function() {
    p.select("#asciiBox1").value(p.gridToString(p.generateGrid()));
    p.reparseGrid();
  };

  p.reparseGrid = function() {
    currentGrid = p.stringToGrid(p.select("#asciiBox1").value());
  }

  p.gridToString = function(grid) {
    let rows = [];
    for (let i = 0; i < grid.length; i++) {
      rows.push(grid[i].join(""));
    }
    return rows.join("\n");
  }

  p.stringToGrid = function(str) {
    let grid = [];
    let lines = str.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let row = [];
      let chars = lines[i].split("");
      for (let j = 0; j < chars.length; j++) {
        row.push(chars[j]);
      }
      grid.push(row);
    }
    return grid;
  }

  p.setup = function() {
    numCols = p.select("#asciiBox1").attribute("rows") | 0;
    numRows = p.select("#asciiBox1").attribute("cols") | 0;
  
    let canvas = p.createCanvas(16 * numCols, 16 * numRows).parent("canvasContainer1");
    canvas.style('float', 'left')
    p.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;
  
    p.select("#reseedButton1").mousePressed(p.reseed);
    p.select("#asciiBox1").input(p.reparseGrid);
  
    p.reseed();
  }

  p.draw = function() {
    p.randomSeed(seed);
    p.drawGrid(currentGrid);
  }

  p.placeTile = function(i, j, ti, tj) {
    p.image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
  }

  p.range = function(first, last) {
    let arr = []
    if (last < first) {
      for (let i = first; i >= last; i--) {
        arr.push(i)
      }
    } else {
      for (let i = first; i <= last; i++) {
        arr.push(i)
      }
    }
    return arr;
  }

  p.generateRiver = function(grid) {
  
    let row = p.floor(p.random(numRows / 4, (3 * numRows) / 4)); // start near center
    let width = p.floor(p.random(3, 8)); // 3–6 tiles wide
  
    for (let col = 0; col < numCols; col++) {
      for (let offset = -p.floor(width / 2); offset <= p.floor(width / 2); offset++) {
        let r = row + offset;
        if (r >= 0 && r < numRows) {
          grid[r][col] = '.'; // river tile
        }
      }
  
      // wiggle
      if (p.random() < 0.3 && row > 1) row--;
      else if (p.random() > 0.7 && row < numRows - 2) row++;
      width = p.constrain(width + p.floor(p.random(-1, 2)), 3, 8);
    }
  }

  p.generatePath = function(grid) {
  
    let col = p.floor(p.random(numCols / 4, (3 * numCols) / 4)); // start near center
    let width = p.floor(p.random(2, 4)); // 2–3 tiles wide
  
    let freezeNextStep = false; // to freeze column after exiting water
  
    for (let row = 0; row < numRows; row++) {
      let crossingWater = false;
  
      for (let offset = -p.floor(width / 2); offset <= p.floor(width / 2); offset++) {
        let c = col + offset;
        if (c >= 0 && c < numCols) {
          if (grid[row][c] === '_') {
            grid[row][c] = '='; // path tile
          } else if (grid[row][c] === '.') {
            grid[row][c] = 'n'; // bridge tile
            crossingWater = true;
          }
        }
      }
  
      // Freeze column movement if currently crossing or just exited water
      if (!crossingWater && !freezeNextStep) {
        if (p.random() < 0.15 && col > 1) col--;
        else if (p.random() > 0.85 && col < numCols - 2) col++;
      }
  
      freezeNextStep = crossingWater; // set freeze for next step after water
    }
  }

  p.generateTrees = function(grid) {
    for(let i = 0; i < grid.length; i++) {
      for(let j = 0; j < grid[i].length; j++) {
        let spawnrate = 0.15
        if (p.random() <= spawnrate && grid[i][j] === '_') {
          grid[i][j] = 't';
        }
        
      }
    }
  }

  p.generateGrid = function() {
    let grid = [];
    for (let i = 0; i < numRows; i++) {
      let row = [];
      for (let j = 0; j < numCols; j++) {
        row.push("_");
      }
      grid.push(row);
    }
    
    p.generateRiver(grid);
    p.generatePath(grid);
    p.generateTrees(grid);
    
    return grid;
  }

  p.drawGrid = function(grid) {
    hoverRow = p.floor(p.mouseY / tileSize);
    hoverCol = p.floor(p.mouseX / tileSize);
    p.background(128);
  
    for(let i = 0; i < grid.length; i++) {
      for(let j = 0; j < grid[i].length; j++) {
        
        if (grid[i][j] === '_' || grid[i][j] === 't') {
          p.placeTile(i, j, p.floor(p.random(4)), 0); // Grass
          if (grid[i][j] === 't') {
            p.placeTile(i, j, 14, 0); // Tree placed after grass (since trees are transparent)
          }
    
          
        } else if (grid[i][j] === '=') {
          let key = `${i},${j}`;
          
          // Detect when the mouse enters the tile
          if (i === hoverRow && j === hoverCol) {
            if (!hoveredDirt[key]) {
              hoveredDirt[key] = true;
              animatingDirt[key] = { frame: 0, tick: 0 }; // Track tile as dirt being animated
            }
          } else {
            hoveredDirt[key] = false;
          }
  
          // Animate once through frames
          if (animatingDirt[key]) {
            let anim = animatingDirt[key];
            anim.tick++;
            if (anim.tick >= dirtSpeed) {
              anim.tick = 0;
              anim.frame++;
            }
            if (anim.frame < dirtFrames) {
              p.placeTile(i, j, anim.frame, 3); // Animated dirt frame
            } else {
              delete animatingDirt[key];
              p.placeTile(i, j, 0, 3); // Return to default dirt
            }
          } else {
            p.placeTile(i, j, 0, 3); // Still dirt
          }
          p.drawContext(grid, i, j, '=', 5, 1, 'n');
          
          
        } else if (grid[i][j] === 'n') {
          p.placeTile(i, j, 16, 4);  // Bridge
          
          
        } else if (grid[i][j] === '.') {
          let key = `${i},${j}`;
  
          // Start animation if mouse is hovering
          if (i === hoverRow && j === hoverCol && !animatingBubbles[key]) {
            animatingBubbles[key] = { frame: 0, tick: 0 };
          }
        
          // Animate if tile is in animatingBubbles
          if (animatingBubbles[key]) {
            let anim = animatingBubbles[key];
            anim.tick++;
  
            if (anim.tick >= bubbleSpeed) {
              anim.tick = 0;
              anim.frame++;
            }
  
            if (anim.frame < bubbleFrames) {
              p.placeTile(i, j, anim.frame, 14); // Bubble tile frame
            } else {
              delete animatingBubbles[key];
              p.placeTile(i, j, 0, 14); // Back to still water (those who know)
            }
          } else {
            p.placeTile(i, j, 0, 14); // Still water (those who know)
          }
  
            p.drawContext(grid, i, j, '.', 10, 1, 'n');
        }
      }
    }
  }

  p.gridCheck = function(grid, i, j, target, exclude = []) {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length) {
      return false;
    }
    if (exclude.includes(grid[i][j])) { // assumes that whatever texture will continue after the edge of the screen.
      return true;
    }
    return grid[i][j] === target;
  }

  // adds same continuing caveat from gridCheck
  p.gridCode = function(grid, i, j, target, exclude = []) {
    let north = p.gridCheck(grid, i - 1, j, target, exclude) ? 1 : 0;
    if (i-1 < 0) {north = 1;}

    let south = p.gridCheck(grid, i + 1, j, target, exclude) ? 1 : 0;
    if (i+1 >= grid.length) {south = 1;}

    let east  = p.gridCheck(grid, i, j + 1, target, exclude) ? 1 : 0;
    if (j+1 >= grid[0].length) {east = 1;}

    let west  = p.gridCheck(grid, i, j - 1, target, exclude) ? 1 : 0;
    if (j-1 < 0) {west = 1;}

    return (north << 0) + (south << 1) + (east << 2) + (west << 3);
  }

  p.drawContext = function(grid, i, j, target, ti, tj, exclude = []) {
    let code = p.gridCode(grid, i, j, target, exclude);
    if (code === 0) return;
  
    let offset = lookup[code];
    if (offset) {
      let [tiOffset, tjOffset] = offset;
      p.placeTile(i, j, ti + tiOffset, tj + tjOffset);
    }
  }

  // im sure there was an easier way but god was this a pain in the ass to figure out.
  const lookup = [
    [0, 0], // surrounded (0, 0)
    [0, 1], // west, east, and south (0, 1)
    [0, -1], // west, east, and north (0, -1)
    [0, 0], // west, east (0, 0)
    [-1, 0], // west, north, and south (-1, 0)
    [-1, 1], // west and south (-1, 1)
    [-1, -1], // west and north (-1, -1)
    [-1, 0], // west (-1, 0)
    [1, 0], // east, north, and south (1, 0)
    [1, 1], // east and south (1, 1) 
    [1, -1], // east and north (1, -1)
    [1, 0], // east (1, 0)
    [0, 0], // north and south (0, 0)
    [0, 1], // south (0, 1)
    [0, -1], // north (0, -1)
    [0, 0]  // isolated (0, 0)
  ];
};
var myp5 = new p5(s, 'c1');



// Sketch Two
var t = function( p ) { 
  let seed = 0;
  let tilesetImage;
  let currentGrid = [];
  let numRows, numCols;
  let hoverRow = -1;
  let hoverCol = -1;
  let presentGrid;
  const tileSize = 16;

  p.preload = function() {
    tilesetImage = p.loadImage(
      "../img/25101045-29e2-407a-894c-e0243cd8c7c6_tilesetP8 (1).png"
    );
  };

  p.reseed = function() {
    seed = (seed | 0) + 1109;
    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.select("#seedReport").html("seed " + seed);
    p.regenerateGrid();
  };

  p.regenerateGrid = function() {
    p.select("#asciiBox2").value(p.gridToString(p.generateGrid()));
    p.reparseGrid();
  };

  p.reparseGrid = function() {
    currentGrid = p.stringToGrid(p.select("#asciiBox2").value());
  }

  p.gridToString = function(grid) {
    let rows = [];
    for (let i = 0; i < grid.length; i++) {
      rows.push(grid[i].join(""));
    }
    return rows.join("\n");
  }

  p.stringToGrid = function(str) {
    let grid = [];
    let lines = str.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let row = [];
      let chars = lines[i].split("");
      for (let j = 0; j < chars.length; j++) {
        row.push(chars[j]);
      }
      grid.push(row);
    }
    return grid;
  }

  p.setup = function() {
    numCols = p.select("#asciiBox2").attribute("rows") | 0;
    numRows = p.select("#asciiBox2").attribute("cols") | 0;
  
    let canvas = p.createCanvas(16 * numCols, 16 * numRows).parent("canvasContainer2");
    // canvas.style("float", "left")
    p.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;
  
    p.select("#reseedButton2").mousePressed(p.reseed);
    p.select("#asciiBox2").input(p.reparseGrid);
  
    p.reseed();
  }

  p.draw = function() {
    p.randomSeed(seed);
    p.drawGrid(currentGrid);
  }

  p.placeTile = function(i, j, ti, tj) {
    p.image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
  }

  p.range = function(first, last) {
    let arr = []
    if (last < first) {
      for (let i = first; i >= last; i--) {
        arr.push(i)
      }
    } else {
      for (let i = first; i <= last; i++) {
        arr.push(i)
      }
    }
    return arr;
  }

  p.generateRocks = function(grid) {
    for(let i = 0; i < grid.length; i++) {
      for(let j = 0; j < grid[i].length; j++) {
        let spawnrate = 0.01
        if (p.random() <= spawnrate && grid[i][j] === '_') {
          grid[i][j] = 't';
        }
        
      }
    }
  }

  p.generateChests = function(grid) {
    for(let i = 0; i < grid.length; i++) {
      for(let j = 0; j < grid[i].length; j++) {
        let spawnrate = 0.01
        if (p.random() <= spawnrate && grid[i][j] === '~') {
          grid[i][j] = 'c';
        }
        
      }
    }
  }

  p.generateDoors = function(grid) {
    let firstDoor = false;
    for(let i = 0; i < grid.length; i++) {
      for(let j = 0; j < grid[i].length; j++) {
        let spawnrate = 0.007
        if (firstDoor == false) {
          spawnrate = .05;
        }
        if (p.random() <= spawnrate && grid[i][j] === '~') {
          grid[i][j] = 'd';
          firstDoor = true;
        }
        
      }
    }
  }

  p.mousePressed = function() {
    let row = p.floor(p.mouseY / tileSize);
    let col = p.floor(p.mouseX / tileSize);
  
    if (
      row >= 0 && row < presentGrid.length &&
      col >= 0 && col < presentGrid[0].length &&
      presentGrid[row][col] === 'd'
    ) {
      p.reseed(); // reseed defined in p2_base.js
    } 
  }

  p.generateRooms = function(grid) {
    const numRooms = p.floor(p.random(3, 7));
    const rooms = [];
    let centers = [];
  
    const maxAttempts = 100;
    let attempts = 0;
  
    while (rooms.length < numRooms && attempts < maxAttempts) {
      attempts++;
  
      const roomWidth = p.floor(p.random(7, 12));  // 7 to 11
      const roomHeight = p.floor(p.random(7, 12));
      const x = p.floor(p.random(1, grid[0].length - roomWidth - 1));
      const y = p.floor(p.random(1, grid.length - roomHeight - 1));
  
      const newRoom = { x, y, w: roomWidth, h: roomHeight };
  
      // Check spacing with existing rooms (must be at least 3 tiles apart)
      let overlaps = rooms.some(room => {
        return !(
          x + roomWidth + 2 < room.x - 2 ||
          x - 2 > room.x + room.w + 2 ||
          y + roomHeight + 2 < room.y - 2 ||
          y - 2 > room.y + room.h + 2
        );
      });
  
      if (overlaps) continue;
  
      // Add floor in the defined room
      for (let i = y + 1; i < y + roomHeight; i++) {
        for (let j = x + 1; j < x + roomWidth; j++) {
          grid[i][j] = '~';
        }
      }
  
      rooms.push(newRoom);
      
      // Track room walls for hallways (idk why i called it centers, at one point i was going to center them but they look cooler this way)
      const centerX = x + p.floor(roomWidth / 2);
      const centerY = y + p.floor(roomHeight / 2);
      centers.push([centerX, centerY]);
  
      // Connect to the previous room's center
      if (centers.length > 1) {
        const [prevX, prevY] = centers[centers.length - 2];
        p.createHallway(grid, prevX, prevY, centerX, centerY);
      }
    }
  }

  p.createHallway = function(grid, x1, y1, x2, y2) {
    // 50% chance of doing horizontal then vertical, or vice versa
    if (p.random() < 0.5) {
      // Horizontal
      for (let x of p.range(x1, x2)) {
        grid[y1][x] = '~';
        grid[y1-1][x] = '~';
        grid[y1+1][x] = '~';
      }
      // Vertical
      for (let y of p.range(y1, y2)) {
        grid[y][x2] = '~';
        grid[y][x2+1] = '~';
        grid[y][x2-1] = '~';
      }
    } else {
      // Vertical
      for (let y of p.range(y1, y2)) {
        grid[y][x1] = '~';
        grid[y][x1+1] = '~';
        grid[y][x1-1] = '~';
      }
      // Horizontal
      for (let x of p.range(x1, x2)) {
        grid[y2][x] = '~';
        grid[y2+1][x] = '~';
        grid[y2-1][x] = '~';
      }
    }
  }

  p.generateGrid = function() {
    let grid = [];
    for (let i = 0; i < numRows; i++) {
      let row = [];
      for (let j = 0; j < numCols; j++) {
        row.push("_");
      }
      grid.push(row);
    }
    
    p.generateRocks(grid);
    p.generateRooms(grid);
    p.generateDoors(grid);
    p.generateChests(grid);
    presentGrid = grid;
    return grid;
  }

  p.drawGrid = function(grid) {
    hoverRow = p.floor(p.mouseY / tileSize);
    hoverCol = p.floor(p.mouseX / tileSize);
    p.background(128);
  
    for(let i = 0; i < grid.length; i++) {
      for(let j = 0; j < grid[i].length; j++) {
        
        if (grid[i][j] === '_' || grid[i][j] === 't') {
          p.placeTile(i, j, p.floor(p.random(4)), 9); // Stone
          if (grid[i][j] === 't') {
            p.placeTile(i, j, 14, 9); // Rock placed after stone (since rocks are transparent)
          }
        } else if (grid[i][j] === '~' || grid[i][j] === 'c' || grid[i][j] === 'd') {
          p.placeTile(i, j, p.floor(p.random(21, 25)), p.floor(p.random(21, 25))); // Dungeon floor
          if (grid[i][j] === 'c') {
            p.placeTile(i, j, 5, 28);
          } else if (grid[i][j] === 'd') {
            p.placeTile(i, j, p.floor(p.random(15, 18)), p.floor(p.random(25, 28)));
          }
          p.drawContext(grid, i, j, '~', 16, 22, ['c', 'd'])
        }
      }
    }
    
    p.noStroke();
    for (let r = 10; r <= 100; r += 3) {
      let alpha = p.map(r, 10, 100, 5, 0); // Fade out as radius increases
      p.fill(255, 255, 0, alpha); // Warm yellowish glow
      p.circle(p.mouseX, p.mouseY, r * 2);
    }
  }

  p.gridCheck = function(grid, i, j, target, exclude = []) {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length) {
      return false;
    }
    if (exclude.includes(grid[i][j])) { // assumes that whatever texture will continue after the edge of the screen.
      return true;
    }
    return grid[i][j] === target;
  }

  p.gridCode = function(grid, i, j, target, exclude = []) {
    let north = p.gridCheck(grid, i - 1, j, target, exclude) ? 1 : 0;
    if (i-1 < 0) {north = 1;}
    
    let south = p.gridCheck(grid, i + 1, j, target, exclude) ? 1 : 0;
    if (i+1 >= grid.length) {south = 1;}
    
    let east  = p.gridCheck(grid, i, j + 1, target, exclude) ? 1 : 0;
    if (j+1 >= grid[0].length) {east = 1;}
    
    let west  = p.gridCheck(grid, i, j - 1, target, exclude) ? 1 : 0;
    if (j-1 < 0) {west = 1;}
    
    return (north << 0) + (south << 1) + (east << 2) + (west << 3);
  }

  p.drawContext = function(grid, i, j, target, ti, tj, exclude = []) {
    let code = p.gridCode(grid, i, j, target, exclude);
    if (code === 0) return;
  
    let offset = lookup[code];
    if (offset) {
      let [tiOffset, tjOffset] = offset;
      p.placeTile(i, j, ti + tiOffset, tj + tjOffset);
    }
  }

  // im sure there was an easier way but god was this a pain in the ass to figure out.
  const lookup = [
    [0, 0], // surrounded (0, 0)
    [0, 1], // west, east, and south (0, 1)
    [0, -1], // west, east, and north (0, -1)
    [0, 0], // west, east (0, 0)
    [-1, 0], // west, north, and south (-1, 0)
    [-1, 1], // west and south (-1, 1)
    [-1, -1], // west and north (-1, -1)
    [-1, 0], // west (-1, 0)
    [1, 0], // east, north, and south (1, 0)
    [1, 1], // east and south (1, 1) 
    [1, -1], // east and north (1, -1)
    [1, 0], // east (1, 0)
    [0, 0], // north and south (0, 0)
    [0, 1], // south (0, 1)
    [0, -1], // north (0, -1)
    [0, 0]  // isolated (0, 0)
  ];
};
var myp5 = new p5(t, 'c2');