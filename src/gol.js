(function() {

  const CELL_SIZE = 5;
  let canvas, context, width, height;
  let grid, rows, columns;

  document.addEventListener('DOMContentLoaded', init, false);

  function init() {
    canvas  = $('canvas')[0];
    context = canvas.getContext('2d');
    width   = canvas.width;
    height  = canvas.height;
    grid    = createGrid();
    rows    = grid.length;
    columns = grid[0].length;
    seed();
    window.setInterval(draw, 33);
  }

  function createGrid() {
    return Array.from({ length: Math.floor(height / CELL_SIZE) }, (_, r) => {
      return Array.from({ length: Math.floor(width / CELL_SIZE) }, (_, c) => {
        return { alive: false, x: c * CELL_SIZE, y: r * CELL_SIZE };
      });
    });
  }

  function seed() {
    let seededCells = [];
    for (let i = 0; i < rows; i++) {
      seededCells.push({
        x: getRandomNumber(1, (rows - CELL_SIZE)) * CELL_SIZE,
        y: getRandomNumber(1, (columns - CELL_SIZE)) * CELL_SIZE
      });
    }
    
    for (let s = 0; s < seededCells.length; s++) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
          if (grid[r][c].x === seededCells[s].x && grid[r][c].y === seededCells[s].y) {
            grid[r][c].alive = true;
            grid[r][c+getRandomNumber(-1, 1)].alive = true;
            grid[r][c+getRandomNumber(-1, 1)].alive = true;
            grid[r+getRandomNumber(-1, 1)][c].alive = true;
            grid[r+getRandomNumber(-1, 1)][c-1].alive = true;
            grid[r+getRandomNumber(-1, 1)][c-1].alive = true;
          }
        }
      }
    }
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    let updatedGrid = createGrid();
    for (let r = 0; r < rows; r ++) {
      for (let c = 0; c < columns; c ++) {
        if (grid[r][c].alive) {
          context.fillRect(grid[r][c].x, grid[r][c].y, CELL_SIZE, CELL_SIZE);
        }
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
    let minRow = (r === 0)           ? 0 : r - 1;
    let minCol = (c === 0)           ? 0 : c - 1;
    let maxRow = (r === rows - 1)    ? r : r + 1;
    let maxCol = (c === columns - 1) ? c : c + 1;
    
    for (let checkRow = minRow; checkRow >= minRow && checkRow <= maxRow; checkRow++) {
      for (let checkCol = minCol; checkCol >= minCol && checkCol <= maxCol; checkCol++) {
        if (grid[checkRow][checkCol].alive && grid[r][c] != grid[checkRow][checkCol]) count++;
      }
    }
    return count;
  }
  
  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

})();
