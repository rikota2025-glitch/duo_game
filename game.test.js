const { describe, it, assert, assertEqual, render } = TestRunner;

// テストはここに追加していく

describe('createGameState', () => {
  it('レベルデータからゲーム状態を作成する', () => {
    const level = [["red", "blue"], ["blue", "red"], []];
    const state = createGameState(level);
    assertEqual(state.tubes.length, 3);
    assertEqual(state.tubes[0], ["red", "blue"]);
    assertEqual(state.tubes[2], []);
    assertEqual(state.moves, 0);
    assertEqual(state.selectedTube, -1);
    assertEqual(state.history.length, 0);
  });

  it('元のレベルデータを変更しない（ディープコピー）', () => {
    const level = [["red", "blue"], ["blue", "red"]];
    const state = createGameState(level);
    state.tubes[0].push("green");
    assertEqual(level[0].length, 2);
  });
});

render();
