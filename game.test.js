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

describe('canMove', () => {
  it('同じ色の上に移動できる', () => {
    const tubes = [["red", "blue"], ["green", "blue"]];
    assert(canMove(tubes, 0, 1) === true);
  });

  it('空の試験管に移動できる', () => {
    const tubes = [["red", "blue"], []];
    assert(canMove(tubes, 0, 1) === true);
  });

  it('違う色の上には移動できない', () => {
    const tubes = [["red", "blue"], ["green", "red"]];
    assert(canMove(tubes, 0, 1) === false);
  });

  it('満杯の試験管には移動できない', () => {
    const tubes = [["red"], ["a", "b", "c", "d", "e"]];
    assert(canMove(tubes, 0, 1) === false);
  });

  it('空の試験管からは移動できない', () => {
    const tubes = [[], ["red"]];
    assert(canMove(tubes, 0, 1) === false);
  });

  it('同じ試験管には移動できない', () => {
    const tubes = [["red", "blue"]];
    assert(canMove(tubes, 0, 0) === false);
  });
});

render();
