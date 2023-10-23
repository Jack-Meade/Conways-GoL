(function () {

  const CELL_SIZES = [5, 7, 10, 14];
  const SPEED_VALUES = [50, 100, 200, 500, 1000, 2000, 5000];
  let canvas, context, width, height;
  let grid, numRows, numColumns;
  let controls, gameRunning, restartRequired, population, generation;

  $(document).on('DOMContentLoaded', init);

  function init(starting, seed) {
    canvas = $('canvas')[0];
    context = canvas.getContext('2d');
    context.lineWidth = 1;
    context.strokeStyle = 'grey';
    width = canvas.width;
    height = canvas.height;
    controls = {
      pause: $('#pause'), play: $('#play'), step: $('#step'), restart: $('#restart'), 
      speed: { input: $('#speed-input'), output: $('#speed-output') },
      size: { input: $('#size-input'), output: $('#size-output') },
      seed: $('#seed-checkbox'),
      grid: $('#grid-checkbox')
    }
    restartRequired = false;
    population = generation = 0;
    let size = getCurrentSize();
    numRows = Math.floor(height / size);
    numColumns = Math.floor(width / size);
    grid = createGrid();
    playGol();
    if (starting || seed) seedGrid();
    if (starting) setupControls();
  }

  function createGrid() {
    return Array.from({ length: numRows }, () => {
      return new Array(numColumns).fill(0);
    });
  }

  function seedGrid() {
    for (let _ = 0; _ < numRows; _++) {
      let r = getRandomNumber(1, numRows - 2);
      let c = getRandomNumber(1, numColumns - 2);
      grid[r][c] = 1;
      for (let __ = 0; __ < getRandomNumber(0, 8); __++) {
        grid[r][c + getRandomNumber(-1, 1)] = 1;
        grid[r + getRandomNumber(-1, 1)][c] = 1;
      }
    }
  }

  function run() {
    updateGrid();
    drawGrid();
  }

  function drawGrid(userInput) {
    context.clearRect(0, 0, width, height);
    let currentPopulation = 0;
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numColumns; c++) {
        if (grid[r][c]) {
          currentPopulation++;
          drawCell('fillRect', r, c);
        } else {
          drawCell('clearRect', r, c);
        }
      }
    }
    population = currentPopulation;
    updateInfoTexts(userInput);
  }

  function drawCell(func, r, c) {
    let size = getCurrentSize();
    let gridOffset = controls.grid[0].checked ? 1 : 0;
    context[func](c * size + gridOffset, r * size + gridOffset, size - gridOffset, size - gridOffset);
    if (gridOffset) {
      context.strokeRect(c * size, r * size, size, size);
    }
  }

  function updateGrid() {
    let updatedGrid = createGrid();
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numColumns; c++) {
        switch (getCurrentNeighbourCount(r, c)) {
          case 2: updatedGrid[r][c] = grid[r][c]; break;
          case 3: updatedGrid[r][c] = 1; break;
          default: updatedGrid[r][c] = 0;
        }
      }
    }
    grid = updatedGrid;
  }

  function getCurrentNeighbourCount(r, c) {
    let count = 0;
    let minRow = Math.max(0, r - 1);
    let minCol = Math.max(0, c - 1);
    let maxRow = Math.min(numRows - 1, r + 1);
    let maxCol = Math.min(numColumns - 1, c + 1);

    for (let checkRow = minRow; checkRow >= minRow && checkRow <= maxRow; checkRow++) {
      for (let checkCol = minCol; checkCol >= minCol && checkCol <= maxCol; checkCol++) {
        if (grid[checkRow][checkCol] && !(r === checkRow && c === checkCol)) count++;
      }
    }
    return count;
  }

  function setupControls() {
    resetControls();

    $(document).on('keydown', (event) => {
      if (event.code === 'Space' && !controls.step.attr('disabled')) {
        event.preventDefault();
        run();
      }
    });

    $('h3').on('click', () => $('ul').toggle('slow'));

    controls.pause.on('click', () => {
      pauseGol();
      toggleControls();
    });

    controls.play.on('click', () => {
      playGol();
      toggleControls();
    });

    controls.step.on('click', run);

    controls.restart.on('click', () => {
      let wasPaused = !gameRunning;
      restartRequired = false;
      pauseGol();
      init(false, controls.seed[0].checked);
      drawGrid();
      resetControls();
      if (wasPaused) {
        pauseGol();
        toggleControls();
      }
    });

    controls.speed.input.on('input', (event) => {
      controls.speed.input.attr('value', event.target.value);
      controls.speed.output.text(`(updated every ${getCurrentSpeed()}ms)`);
    });

    controls.size.input.on('input', (event) => {
      controls.size.input.attr('value', event.target.value);
      controls.size.output.text(`(${getCurrentSize()} - restart required to continue)`);
      [controls.play, controls.step, controls.grid].forEach(elm => elm.attr('disabled', true));
      restartRequired = true;
    });

    controls.grid.on('click', drawGrid);

    $(canvas).on('mousedown', (event) => {
      if (restartRequired) return;
      let size = getCurrentSize();
      let bounded = canvas.getBoundingClientRect();
      let r = Math.floor((event.clientY - bounded.top) / size);
      let c = Math.floor((event.clientX - bounded.left) / size);
      let [status, func, pop] = grid[r][c] ? [0, 'clearRect', -1] : [1, 'fillRect', 1];
      grid[r][c] = status;
      population += pop;
      updateInfoTexts(true);
      drawCell(func, r, c);
    });
  }

  function resetControls() {
    controls.speed.output.text(`(updated every ${getCurrentSpeed()}ms)`);
    controls.size.output.text(`(${getCurrentSize()} - changing this will necessitate a restart)`);
    Object.values(controls)
      .map(elm => elm = !elm.attr ? $(elm.input) : elm)
      .forEach(elm => {
        let disabled = (![controls.pause, controls.restart, controls.seed, controls.grid].includes(elm));
        elm.attr('disabled', disabled);
      });
  }

  function toggleControls() {
    Object.values(controls)
      .filter(elm => ![controls.restart, controls.seed, controls.grid].includes(elm))
      .map(elm => elm = (!elm.attr) ? $(elm.input) : elm)
      .forEach(elm => {
        elm.attr('disabled', !elm.attr('disabled'));
      });
  }

  function playGol() {
    gameRunning = window.setInterval(run, getCurrentSpeed());
  }

  function pauseGol() {
    gameRunning = window.clearInterval(gameRunning);
  }

  function updateInfoTexts(userInput) {
    $('#population').text(`Population: ${population}`);
    if (!userInput) $('#generation').text(`Generation: ${++generation}`);
  }

  function getCurrentSpeed() {
    return SPEED_VALUES[controls.speed.input.attr('value')];
  }

  function getCurrentSize() {
    return CELL_SIZES[controls.size.input.attr('value')];
  }

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

})();
