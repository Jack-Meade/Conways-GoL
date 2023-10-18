(function() {

  const CELL_SIZE = 5;
  let canvas, context, width, height, drawInterval, buttons;
  let grid, numRows, numColumns;

  document.addEventListener('DOMContentLoaded', init, false);

  function init() {
    canvas     = $('canvas')[0];
    context    = canvas.getContext('2d');
    width      = canvas.width;
    height     = canvas.height;
    grid       = createGrid();
    numRows    = grid.length;
    numColumns = grid[0].length;
    buttons    = { pause: $('#pause'), play: $('#play'), step: $('#step') };
    seed();
    addEventHandlers();
    drawInterval = window.setInterval(draw, 33);
  }

  function createGrid() {
    return Array.from({ length: Math.floor(height / CELL_SIZE) }, (_, r) => {
      return Array.from({ length: Math.floor(width / CELL_SIZE) }, (_, c) => {
        return { alive: false, x: c * CELL_SIZE, y: r * CELL_SIZE };
      });
    });
  }

  function seed() {    
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

  function draw() {
    context.clearRect(0, 0, width, height);
    let updatedGrid = createGrid();
    for (let r = 0; r < numRows; r ++) {
      for (let c = 0; c < numColumns; c ++) {
        if (grid[r][c].alive) context.fillRect(grid[r][c].x, grid[r][c].y, CELL_SIZE, CELL_SIZE);
        
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

  function addEventHandlers() {
    buttons.pause.on('click', () => { 
      window.clearInterval(drawInterval);
      toggleButtons();
    });
    buttons.play.on('click', () => { 
      drawInterval = window.setInterval(draw, 33);
      toggleButtons();
    });
    buttons.step.on('click', draw);
  }

  function toggleButtons() {
    Object.values(buttons).forEach(elm => elm.attr('disabled', !elm.attr('disabled')));
  }
  
  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

})();
