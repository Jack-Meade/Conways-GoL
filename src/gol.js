(function() {

  const CELL_SIZES = [4, 5, 7, 10, 14];
  const SPEED_VALUES = [50, 100, 200, 500, 1000, 2000, 5000];
  let canvas, context, width, height;
  let grid, numRows, numColumns;
  let controls, gameRunning, restartRequired, population;

  document.addEventListener('DOMContentLoaded', init, false);

  function init(starting, seed) {
    canvas   = $('canvas')[0];
    context  = canvas.getContext('2d');
    width    = canvas.width;
    height   = canvas.height;
    controls = { 
      pause: $('#pause'), play: $('#play'), step: $('#step'), 
      restart: $('#restart'), seed: $('#seed-checkbox'),
      speed: { input: $('#speed-input'), output: $('#speed-output') },
      size: { input: $('#size-input'), output: $('#size-output') },
    };
    restartRequired = false;
    population      = 0;
    grid            = createGrid();
    numRows         = grid.length;
    numColumns      = grid[0].length;
    playGol()
    if (starting || seed) seedGrid();
    if (starting) setupControls();
  }

  function createGrid() {
    let size = getCurrentSize();
    return Array.from({ length: Math.floor(height / size) }, () => {
      return new Array(Math.floor(width / size)).fill(0);
    });
  }

  function seedGrid() {
    for (let _ = 0; _ < numRows; _++) {
      let r = getRandomNumber(1, (numColumns - 2));
      let c = getRandomNumber(1, (numRows - 2));
      grid[r][c] = 1;
      for (let __ = 0; __ < getRandomNumber(0, 8); __++) {
        grid[r][c+getRandomNumber(-1, 1)] = 1;
        grid[r+getRandomNumber(-1, 1)][c] = 1;
      }
    }
  }

  function run() {
    update();
    draw();
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    let currentPopulation = 0;
    for (let r = 0; r < numRows; r ++) {
      for (let c = 0; c < numColumns; c ++) {
        if (grid[r][c]) {
          currentPopulation++;
          drawCell('fillRect', r, c);
        }
      }
    }
    population = currentPopulation;
    updatePopulationText();
  }
  
  function drawCell(func, r, c) {
    let size = getCurrentSize();
    context[func](c * size, r * size, size, size);
  }

  function update() {
    let updatedGrid = createGrid();
    for (let r = 0; r < numRows; r ++) {
      for (let c = 0; c < numColumns; c ++) {        
        switch (getCurrentNeighbourCount(r, c)) {
          case 2:  updatedGrid[r][c] = grid[r][c]; break; 
          case 3:  updatedGrid[r][c] = 1; break; 
          default: updatedGrid[r][c] = 0;
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
        if (grid[checkRow][checkCol] && !(r === checkRow && c === checkCol)) count++;
      }
    }
    return count;
  }

  function setupControls() {
    resetButtons();

    $(document).on('keydown', (event) => {
      if (event.code === 'Space' && !controls.step.attr('disabled')) {
        event.preventDefault();
        run();
      }
    });

    $('h3').on('click', () => $('ul').toggle('slow'));
    
    controls.pause.on('click', () => { 
      pauseGol();
      toggleButtons();
    });

    controls.play.on('click', () => {
      if (restartRequired) {
        resetButtons();
        controls.restart.trigger('click');
        return;
      }
      playGol()
      toggleButtons();
    });

    controls.step.on('click', run);
    
    controls.restart.on('click', () => {
      restartRequired = false;
      pauseGol();
      init(false, controls.seed[0].checked);
      draw();
    });
    
    controls.speed.input.on('input', (event) => {
      controls.speed.input.attr('value', event.target.value);
      controls.speed.output.text(`(updated every ${getCurrentSpeed()}ms)`);
    });

    controls.size.input.on('input', (event) => {
      controls.size.input.attr('value', event.target.value);
      controls.size.output.text(`(${getCurrentSize()} - restart required, play to continue)`);
      controls.step.attr('disabled', true);
      restartRequired = true;
    });
    
    $(canvas).on('mousedown', (event) => {
      if (restartRequired) return;
      let size = getCurrentSize();
      let bounded = canvas.getBoundingClientRect();
      let r = Math.floor((event.clientY - bounded.top) / size);
      let c = Math.floor((event.clientX - bounded.left) / size);
      let [status, func, pop] = grid[r][c] ? [0, 'clearRect', -1] : [1, 'fillRect', 1];
      grid[r][c] = status;
      population += pop;
      updatePopulationText();
      drawCell(func, r, c);
    });
  }

  function updatePopulationText() {
    $('#population').text(`Population: ${population}`);
  }

  function getCurrentSpeed() {
    return SPEED_VALUES[controls.speed.input.attr('value')];
  }

  function getCurrentSize() {
    return CELL_SIZES[controls.size.input.attr('value')];
  }

  function resetButtons() {
    controls.speed.output.text(`(updated every ${getCurrentSpeed()}ms)`);
    controls.size.output.text(`(${getCurrentSize()} - changing this will cause a restart)`);
    Object.values(controls).forEach(elm => {
      elm = (!elm.attr) ? $(elm.input) : elm;
      let disabled = (![controls.pause, controls.restart, controls.seed].includes(elm));
      elm.attr('disabled', disabled);
    });
  }

  function toggleButtons() {
    Object.values(controls).forEach(elm => {
      elm = (!elm.attr) ? $(elm.input) : elm;
      if (elm !== controls.seed) elm.attr('disabled', !elm.attr('disabled'));
    });
  }

  function playGol() {
    gameRunning = window.setInterval(run, getCurrentSpeed());
  }

  function pauseGol() {
    gameRunning = window.clearInterval(gameRunning);
  }
  
  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

})();
