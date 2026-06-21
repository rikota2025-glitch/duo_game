// Water Sort Puzzle — ゲームロジック

function createGameState(level) {
  return {
    tubes: level.map(tube => [...tube]),
    moves: 0,
    selectedTube: -1,
    history: [],
  };
}

const TUBE_CAPACITY = 5;

function countMovable(tubes, fromIndex) {
  const tube = tubes[fromIndex];
  if (tube.length === 0) return 0;
  const topColor = tube[tube.length - 1];
  let count = 0;
  for (let i = tube.length - 1; i >= 0; i--) {
    if (tube[i] === topColor) count++;
    else break;
  }
  return count;
}

function canMove(tubes, fromIndex, toIndex) {
  if (fromIndex === toIndex) return false;
  const from = tubes[fromIndex];
  const to = tubes[toIndex];
  if (from.length === 0) return false;
  if (to.length >= TUBE_CAPACITY) return false;
  if (to.length === 0) return true;
  return from[from.length - 1] === to[to.length - 1];
}

function executeMove(state, fromIndex, toIndex) {
  const newTubes = state.tubes.map(tube => [...tube]);
  const moveCount = Math.min(
    countMovable(newTubes, fromIndex),
    TUBE_CAPACITY - newTubes[toIndex].length
  );
  const colors = newTubes[fromIndex].splice(newTubes[fromIndex].length - moveCount, moveCount);
  newTubes[toIndex].push(...colors);

  return {
    tubes: newTubes,
    moves: state.moves + 1,
    selectedTube: -1,
    history: [...state.history, {
      tubes: state.tubes.map(tube => [...tube]),
      moves: state.moves,
    }],
  };
}

function undo(state) {
  if (state.history.length === 0) return state;
  const prev = state.history[state.history.length - 1];
  return {
    tubes: prev.tubes.map(tube => [...tube]),
    moves: prev.moves,
    selectedTube: -1,
    history: state.history.slice(0, -1),
  };
}

function isSolved(tubes) {
  for (const tube of tubes) {
    if (tube.length === 0) continue;
    const firstColor = tube[0];
    for (let i = 1; i < tube.length; i++) {
      if (tube[i] !== firstColor) return false;
    }
  }
  return true;
}

function handleTap(state, tubeIndex) {
  if (state.selectedTube === -1) {
    if (state.tubes[tubeIndex].length === 0) return state;
    return { ...state, selectedTube: tubeIndex };
  }

  if (state.selectedTube === tubeIndex) {
    return { ...state, selectedTube: -1 };
  }

  if (canMove(state.tubes, state.selectedTube, tubeIndex)) {
    return executeMove(state, state.selectedTube, tubeIndex);
  }

  if (state.tubes[tubeIndex].length === 0) {
    return state;
  }
  return { ...state, selectedTube: tubeIndex };
}

let currentLevel = 0;
let gameState = null;

function getCleared() {
  try {
    return JSON.parse(localStorage.getItem('waterSortCleared') || '[]');
  } catch {
    return [];
  }
}

function setCleared(levelIndex) {
  const cleared = getCleared();
  if (!cleared.includes(levelIndex)) {
    cleared.push(levelIndex);
    localStorage.setItem('waterSortCleared', JSON.stringify(cleared));
  }
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');
}

function renderLevelSelect() {
  const grid = document.getElementById('level-grid');
  const cleared = getCleared();
  grid.innerHTML = '';
  for (let i = 0; i < LEVELS.length; i++) {
    const btn = document.createElement('button');
    btn.className = 'level-btn' + (cleared.includes(i) ? ' cleared' : '');
    btn.textContent = i + 1;
    btn.addEventListener('click', () => startLevel(i));
    grid.appendChild(btn);
  }
}

function renderGame() {
  document.getElementById('level-label').textContent = `Level ${currentLevel + 1}`;
  document.getElementById('moves-label').textContent = `Moves: ${gameState.moves}`;

  const container = document.getElementById('tubes-container');
  container.innerHTML = '';

  for (let i = 0; i < gameState.tubes.length; i++) {
    const tube = gameState.tubes[i];
    const tubeEl = document.createElement('div');
    tubeEl.className = 'tube' + (gameState.selectedTube === i ? ' selected' : '');
    tubeEl.addEventListener('click', () => onTubeTap(i));

    for (let j = 0; j < tube.length; j++) {
      const liquid = document.createElement('div');
      liquid.className = 'liquid';
      liquid.style.backgroundColor = COLORS[tube[j]];
      tubeEl.appendChild(liquid);
    }
    container.appendChild(tubeEl);
  }
}

function startLevel(levelIndex) {
  currentLevel = levelIndex;
  gameState = createGameState(LEVELS[levelIndex]);
  showScreen('game-screen');
  document.getElementById('clear-overlay').classList.add('hidden');
  renderGame();
}

function onTubeTap(tubeIndex) {
  gameState = handleTap(gameState, tubeIndex);
  renderGame();

  if (isSolved(gameState.tubes) && gameState.moves > 0) {
    setCleared(currentLevel);
    document.getElementById('clear-moves').textContent = `${gameState.moves} 手でクリア！`;
    document.getElementById('clear-overlay').classList.remove('hidden');
  }
}

function init() {
  showScreen('title-screen');

  document.getElementById('start-btn').addEventListener('click', () => {
    renderLevelSelect();
    showScreen('level-select-screen');
  });

  document.getElementById('undo-btn').addEventListener('click', () => {
    gameState = undo(gameState);
    renderGame();
  });

  document.getElementById('restart-btn').addEventListener('click', () => {
    startLevel(currentLevel);
  });

  document.getElementById('back-btn').addEventListener('click', () => {
    renderLevelSelect();
    showScreen('level-select-screen');
  });

  document.getElementById('next-level-btn').addEventListener('click', () => {
    if (currentLevel < LEVELS.length - 1) {
      startLevel(currentLevel + 1);
    } else {
      renderLevelSelect();
      showScreen('level-select-screen');
    }
  });

  document.getElementById('back-to-levels-btn').addEventListener('click', () => {
    renderLevelSelect();
    showScreen('level-select-screen');
  });
}

document.addEventListener('DOMContentLoaded', init);
