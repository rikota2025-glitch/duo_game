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

describe('executeMove', () => {
  it('一番上の液体を1つだけ移動する', () => {
    const state = createGameState([["red", "blue"], ["green", "blue"]]);
    const newState = executeMove(state, 0, 1);
    assertEqual(newState.tubes[0], ["red"]);
    assertEqual(newState.tubes[1], ["green", "blue", "blue"]);
  });

  it('手数が1増える', () => {
    const state = createGameState([["red"], []]);
    const newState = executeMove(state, 0, 1);
    assertEqual(newState.moves, 1);
  });

  it('履歴に前の状態が保存される', () => {
    const state = createGameState([["red", "blue"], []]);
    const newState = executeMove(state, 0, 1);
    assertEqual(newState.history.length, 1);
    assertEqual(newState.history[0].tubes[0], ["red", "blue"]);
  });

  it('選択状態がリセットされる', () => {
    const state = createGameState([["red"], []]);
    state.selectedTube = 0;
    const newState = executeMove(state, 0, 1);
    assertEqual(newState.selectedTube, -1);
  });

  it('元の状態を変更しない（イミュータブル）', () => {
    const state = createGameState([["red", "blue"], []]);
    executeMove(state, 0, 1);
    assertEqual(state.tubes[0], ["red", "blue"]);
    assertEqual(state.moves, 0);
  });
});

render();
