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
  const color = newTubes[fromIndex].pop();
  newTubes[toIndex].push(color);

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
