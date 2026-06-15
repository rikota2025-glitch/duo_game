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

describe('undo', () => {
  it('直前の移動を取り消す', () => {
    const state = createGameState([["red", "blue"], []]);
    const moved = executeMove(state, 0, 1);
    const undone = undo(moved);
    assertEqual(undone.tubes[0], ["red", "blue"]);
    assertEqual(undone.tubes[1], []);
    assertEqual(undone.moves, 0);
  });

  it('履歴が空のときはそのまま返す', () => {
    const state = createGameState([["red"], []]);
    const undone = undo(state);
    assertEqual(undone.tubes[0], ["red"]);
    assertEqual(undone.history.length, 0);
  });

  it('選択状態がリセットされる', () => {
    const state = createGameState([["red"], []]);
    const moved = executeMove(state, 0, 1);
    moved.selectedTube = 0;
    const undone = undo(moved);
    assertEqual(undone.selectedTube, -1);
  });

  it('複数回undoできる', () => {
    let state = createGameState([["red", "blue"], ["green"], []]);
    state = executeMove(state, 0, 2);
    state = executeMove(state, 1, 2);
    state = undo(state);
    assertEqual(state.tubes[1], ["green"]);
    assertEqual(state.tubes[2], ["blue"]);
    state = undo(state);
    assertEqual(state.tubes[0], ["red", "blue"]);
    assertEqual(state.tubes[2], []);
  });
});

describe('isSolved', () => {
  it('全試験管が単色または空ならクリア', () => {
    const tubes = [["red", "red", "red"], ["blue", "blue", "blue"], []];
    assert(isSolved(tubes) === true);
  });

  it('混ざっていたらクリアではない', () => {
    const tubes = [["red", "blue"], ["blue", "red"]];
    assert(isSolved(tubes) === false);
  });

  it('全て空でもクリア', () => {
    const tubes = [[], [], []];
    assert(isSolved(tubes) === true);
  });

  it('1色だけの試験管はクリア', () => {
    const tubes = [["red"]];
    assert(isSolved(tubes) === true);
  });

  it('5段全て同じ色でクリア', () => {
    const tubes = [["red", "red", "red", "red", "red"], []];
    assert(isSolved(tubes) === true);
  });
});

describe('handleTap', () => {
  it('未選択で試験管をタップすると選択される', () => {
    const state = createGameState([["red", "blue"], ["green"]]);
    const newState = handleTap(state, 0);
    assertEqual(newState.selectedTube, 0);
  });

  it('空の試験管をタップしても選択されない', () => {
    const state = createGameState([["red"], []]);
    const newState = handleTap(state, 1);
    assertEqual(newState.selectedTube, -1);
  });

  it('選択中に同じ試験管をタップすると選択解除', () => {
    const state = createGameState([["red", "blue"], []]);
    state.selectedTube = 0;
    const newState = handleTap(state, 0);
    assertEqual(newState.selectedTube, -1);
  });

  it('選択中に移動可能な試験管をタップすると移動する', () => {
    const state = createGameState([["red", "blue"], []]);
    state.selectedTube = 0;
    const newState = handleTap(state, 1);
    assertEqual(newState.tubes[0], ["red"]);
    assertEqual(newState.tubes[1], ["blue"]);
    assertEqual(newState.selectedTube, -1);
    assertEqual(newState.moves, 1);
  });

  it('選択中に移動不可な試験管をタップすると選択先が切り替わる', () => {
    const state = createGameState([["red", "blue"], ["green", "red"], ["blue"]]);
    state.selectedTube = 0;
    const newState = handleTap(state, 1);
    assertEqual(newState.selectedTube, 1);
    assertEqual(newState.moves, 0);
  });

  it('選択中に移動不可な空でない試験管をタップすると選択切り替え', () => {
    const state = createGameState([["red"], ["blue", "blue", "blue", "blue", "blue"]]);
    state.selectedTube = 0;
    const newState = handleTap(state, 1);
    assertEqual(newState.selectedTube, 1);
  });
});

describe('LEVELS', () => {
  it('30レベルある', () => {
    assertEqual(LEVELS.length, 30);
  });

  it('レベル1〜5は3色、5本（3色付き+2空）', () => {
    for (let i = 0; i < 5; i++) {
      const level = LEVELS[i];
      assertEqual(level.length, 5, `Level ${i + 1} should have 5 tubes`);
      const colors = new Set();
      let emptyCount = 0;
      for (const tube of level) {
        if (tube.length === 0) { emptyCount++; continue; }
        tube.forEach(c => colors.add(c));
      }
      assertEqual(emptyCount, 2, `Level ${i + 1} should have 2 empty tubes`);
      assertEqual(colors.size, 3, `Level ${i + 1} should use 3 colors`);
    }
  });

  it('レベル6〜12は4色、6本', () => {
    for (let i = 5; i < 12; i++) {
      const level = LEVELS[i];
      assertEqual(level.length, 6, `Level ${i + 1} should have 6 tubes`);
      const colors = new Set();
      let emptyCount = 0;
      for (const tube of level) {
        if (tube.length === 0) { emptyCount++; continue; }
        tube.forEach(c => colors.add(c));
      }
      assertEqual(emptyCount, 2, `Level ${i + 1} should have 2 empty tubes`);
      assertEqual(colors.size, 4, `Level ${i + 1} should use 4 colors`);
    }
  });

  it('レベル13〜20は5色、7本', () => {
    for (let i = 12; i < 20; i++) {
      const level = LEVELS[i];
      assertEqual(level.length, 7, `Level ${i + 1} should have 7 tubes`);
      const colors = new Set();
      let emptyCount = 0;
      for (const tube of level) {
        if (tube.length === 0) { emptyCount++; continue; }
        tube.forEach(c => colors.add(c));
      }
      assertEqual(emptyCount, 2, `Level ${i + 1} should have 2 empty tubes`);
      assertEqual(colors.size, 5, `Level ${i + 1} should use 5 colors`);
    }
  });

  it('レベル21〜27は6色、8本', () => {
    for (let i = 20; i < 27; i++) {
      const level = LEVELS[i];
      assertEqual(level.length, 8, `Level ${i + 1} should have 8 tubes`);
      const colors = new Set();
      let emptyCount = 0;
      for (const tube of level) {
        if (tube.length === 0) { emptyCount++; continue; }
        tube.forEach(c => colors.add(c));
      }
      assertEqual(emptyCount, 2, `Level ${i + 1} should have 2 empty tubes`);
      assertEqual(colors.size, 6, `Level ${i + 1} should use 6 colors`);
    }
  });

  it('レベル28〜30は7色、9本', () => {
    for (let i = 27; i < 30; i++) {
      const level = LEVELS[i];
      assertEqual(level.length, 9, `Level ${i + 1} should have 9 tubes`);
      const colors = new Set();
      let emptyCount = 0;
      for (const tube of level) {
        if (tube.length === 0) { emptyCount++; continue; }
        tube.forEach(c => colors.add(c));
      }
      assertEqual(emptyCount, 2, `Level ${i + 1} should have 2 empty tubes`);
      assertEqual(colors.size, 7, `Level ${i + 1} should use 7 colors`);
    }
  });

  it('各色はちょうど5個ずつ存在する', () => {
    for (let i = 0; i < LEVELS.length; i++) {
      const colorCount = {};
      for (const tube of LEVELS[i]) {
        for (const c of tube) {
          colorCount[c] = (colorCount[c] || 0) + 1;
        }
      }
      for (const [color, count] of Object.entries(colorCount)) {
        assertEqual(count, 5, `Level ${i + 1}: color "${color}" has ${count} instead of 5`);
      }
    }
  });

  it('色付き試験管は全て5段', () => {
    for (let i = 0; i < LEVELS.length; i++) {
      for (const tube of LEVELS[i]) {
        if (tube.length > 0) {
          assertEqual(tube.length, 5, `Level ${i + 1}: non-empty tube has ${tube.length} instead of 5`);
        }
      }
    }
  });
});

describe('統合テスト: ゲームフロー', () => {
  it('レベル開始からクリアまでの一連のフロー', () => {
    const simpleLevel = [
      ["red", "blue"],
      ["blue", "red"],
      [],
    ];
    let state = createGameState(simpleLevel);

    // red を空の試験管に移動
    state = handleTap(state, 0);
    assertEqual(state.selectedTube, 0);
    state = handleTap(state, 2);
    assertEqual(state.tubes[0], ["red"]);
    assertEqual(state.tubes[2], ["blue"]);
    assertEqual(state.moves, 1);

    // tube 1 の red を tube 2 に → 不可（blue の上に red）
    state = handleTap(state, 1);
    assertEqual(state.selectedTube, 1);
    state = handleTap(state, 2);
    assertEqual(state.selectedTube, 2);

    // tube 2 の blue を tube 0 に移動（red の上に blue は不可）
    state = handleTap(state, 0);
    assertEqual(state.selectedTube, 0);

    // 別のアプローチ: restart
    state = createGameState(simpleLevel);

    // tube 1 top = red → tube 2（空）
    state = handleTap(state, 1);
    state = handleTap(state, 2);
    assertEqual(state.tubes[1], ["blue"]);
    assertEqual(state.tubes[2], ["red"]);

    // tube 0 top = blue → tube 1（blue の上）
    state = handleTap(state, 0);
    state = handleTap(state, 1);
    assertEqual(state.tubes[0], ["red"]);
    assertEqual(state.tubes[1], ["blue", "blue"]);

    // tube 0 top = red → tube 2（red の上）
    state = handleTap(state, 0);
    state = handleTap(state, 2);
    assertEqual(state.tubes[0], []);
    assertEqual(state.tubes[2], ["red", "red"]);

    assert(isSolved(state.tubes) === true);
    assertEqual(state.moves, 3);
  });

  it('Undoで操作を戻してもゲームが一貫している', () => {
    const level = [["red", "blue"], ["blue", "red"], []];
    let state = createGameState(level);

    state = handleTap(state, 0);
    state = handleTap(state, 2);
    assertEqual(state.moves, 1);

    state = undo(state);
    assertEqual(state.moves, 0);
    assertEqual(state.tubes[0], ["red", "blue"]);
    assertEqual(state.tubes[2], []);

    // undo後に再度操作可能
    state = handleTap(state, 1);
    state = handleTap(state, 2);
    assertEqual(state.tubes[1], ["blue"]);
    assertEqual(state.tubes[2], ["red"]);
  });
});

render();
