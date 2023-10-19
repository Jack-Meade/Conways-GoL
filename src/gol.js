(function() {

  const CELL_SIZE = 5;
  const SPEED_VALUES = [5, 50, 100, 200, 500, 1000, 2000, 5000];
  let canvas, context, width, height;
  let grid, numRows, numColumns;
  let controls, drawInterval;

  document.addEventListener('DOMContentLoaded', init, false);

  function init(starting, seed) {
    canvas       = $('canvas')[0];
    context      = canvas.getContext('2d');
    width        = canvas.width;
    height       = canvas.height;
    grid         = createGrid();
    numRows      = grid.length;
    numColumns   = grid[0].length;
    controls     = { 
      pause: $('#pause'), play: $('#play'), step: $('#step'), 
      speed: $('#speed-input'), restart: $('#restart'), seed: $('#seed-checkbox')
    };
    playGol()
    if (starting || seed) seedGrid();
    if (starting) setupControls();
  }

  function createGrid() {
    return Array.from({ length: Math.floor(height / CELL_SIZE) }, (_, r) => {
      return Array.from({ length: Math.floor(width / CELL_SIZE) }, (_, c) => {
        return { alive: false, x: c * CELL_SIZE, y: r * CELL_SIZE };
      });
    });
  }

  function seedGrid() {
    for (let _ = 0; _ < numRows; _++) {
      let r = getRandomNumber(1, (numColumns - CELL_SIZE));
      let c = getRandomNumber(1, (numRows - CELL_SIZE));
      grid[r][c].alive = true;
      for (let __ = 0; __ < getRandomNumber(0, 8); __++) {
        grid[r][c+getRandomNumber(-1, 1)].alive = true;
        grid[r+getRandomNumber(-1, 1)][c].alive = true;
      }
    }
  }

  function run() {
    update();
    draw();
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    for (let r = 0; r < numRows; r ++) {
      for (let c = 0; c < numColumns; c ++) {
        if (grid[r][c].alive) context.fillRect(grid[r][c].x, grid[r][c].y, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  function update() {
    let updatedGrid = createGrid();
    for (let r = 0; r < numRows; r ++) {
      for (let c = 0; c < numColumns; c ++) {        
        switch (getCurrentNeighbourCount(r, c)) {
          case 2:  updatedGrid[r][c].alive = grid[r][c].alive; break; 
          case 3:  updatedGrid[r][c].alive = true; break; 
          default: updatedGrid[r][c].alive = false;
        }
      }
    }
    grid = updatedGrid;
  }

  function getCurrentNeighbourCount(r, c) {
    let count  = 0;
    let minRow = (r === 0)              ? 0 : r - 1;
    let minCol = (c === 0)              ? 0 : c - 1;
    let maxRow = (r === numRows - 1)    ? r : r + 1;
    let maxCol = (c === numColumns - 1) ? c : c + 1;
    
    for (let checkRow = minRow; checkRow >= minRow && checkRow <= maxRow; checkRow++) {
      for (let checkCol = minCol; checkCol >= minCol && checkCol <= maxCol; checkCol++) {
        if (grid[checkRow][checkCol].alive && grid[r][c] !== grid[checkRow][checkCol]) count++;
      }
    }
    return count;
  }

  function setupControls() {
    let speedValue = $('#speed-output');
    speedValue.text(`(updated every ${getCurrentSpeed()}ms)`);

    Object.values(controls).forEach(elm => {
      let disabled = (![controls.pause, controls.restart, controls.seed].includes(elm));
      elm.attr('disabled', disabled);
    });
    
    controls.pause.on('click', () => { 
      pauseGol();
      toggleButtons();
    });
    
    controls.play.on('click', () => { 
      playGol()
      toggleButtons();
    });

    controls.step.on('click', () => {
      update();
      draw();
    });
    
    controls.restart.on('click', () => {
      pauseGol();
      init(false, controls.seed[0].checked);
      draw();
    });
    
    controls.speed.on('input', (event) => {
      controls.speed.attr('value', event.target.value);
      speedValue.text(`(updated every ${getCurrentSpeed()}ms)`);
    });
    
    $(canvas).on('mousedown', (event) => {
      if (drawInterval) return;
      let rect = canvas.getBoundingClientRect();
      let r = Math.floor((event.clientY - rect.top) / CELL_SIZE);
      let c = Math.floor((event.clientX - rect.left) / CELL_SIZE);
      let [alive, func] = grid[r][c].alive ? [false, "clearRect"] : [true, "fillRect"];
      grid[r][c].alive = alive;
      context[func](grid[r][c].x, grid[r][c].y, CELL_SIZE, CELL_SIZE);
    });
  }

  function getCurrentSpeed() {
    return SPEED_VALUES[controls.speed.attr('value')];
  }

  function toggleButtons() {
    Object.values(controls).forEach(elm => elm.attr('disabled', !elm.attr('disabled')));
  }

  function playGol() {
    drawInterval = window.setInterval(run, getCurrentSpeed());
  }

  function pauseGol() {
    drawInterval = window.clearInterval(drawInterval);
  }
  
  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

})();
