// Water Sort Puzzle — ゲームロジック

function createGameState(level) {
  return {
    tubes: level.map(tube => [...tube]),
    moves: 0,
    selectedTube: -1,
    history: [],
  };
}
