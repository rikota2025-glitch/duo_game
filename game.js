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
