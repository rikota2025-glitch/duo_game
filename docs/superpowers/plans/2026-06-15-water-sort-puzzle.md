# Water Sort Puzzle 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ブラウザで動作する30レベルのWater Sort Puzzleを作る

**Architecture:** 4ファイル構成（index.html, style.css, game.js, levels.js）。ゲームロジックはグローバル関数として game.js に実装し、テストは game.test.html から直接呼び出す。レベルデータは levels.js にハードコード。画面切り替えはCSSクラスの表示/非表示で管理。

**Tech Stack:** HTML / CSS / JavaScript（フレームワークなし）、テストは自作のミニテストランナー（ブラウザ上で動作）

---

## ファイル構成

| ファイル | 役割 |
|----------|------|
| `index.html` | メインHTML。レベル選択画面とゲーム画面の両方を含む |
| `style.css` | 全スタイル |
| `game.js` | ゲームロジック全般（状態管理、操作、判定） |
| `levels.js` | 30レベルのデータ定義 |
| `test-runner.js` | ミニテストランナー（describe/it/assert） |
| `game.test.js` | game.js のテスト |
| `game.test.html` | テスト実行用HTML |

---

### Task 1: テストランナーのセットアップ

**Files:**
- Create: `test-runner.js`
- Create: `game.test.js`
- Create: `game.test.html`

- [ ] **Step 1: ミニテストランナーを作成**

```javascript
// test-runner.js
const TestRunner = (() => {
  const results = [];
  let currentDescribe = '';

  function describe(name, fn) {
    currentDescribe = name;
    fn();
    currentDescribe = '';
  }

  function it(name, fn) {
    const fullName = currentDescribe ? `${currentDescribe} > ${name}` : name;
    try {
      fn();
      results.push({ name: fullName, pass: true });
    } catch (e) {
      results.push({ name: fullName, pass: false, error: e.message });
    }
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
  }

  function assertEqual(actual, expected, message) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) throw new Error(message || `Expected ${e} but got ${a}`);
  }

  function render() {
    const container = document.getElementById('test-results');
    const passed = results.filter(r => r.pass).length;
    const failed = results.filter(r => !r.pass).length;

    let html = `<h2>Tests: ${passed} passed, ${failed} failed</h2>`;
    for (const r of results) {
      if (r.pass) {
        html += `<div style="color:green">✓ ${r.name}</div>`;
      } else {
        html += `<div style="color:red">✗ ${r.name} — ${r.error}</div>`;
      }
    }
    container.innerHTML = html;
    return { passed, failed, results };
  }

  return { describe, it, assert, assertEqual, render };
})();
```

- [ ] **Step 2: テスト用HTMLを作成**

```html
<!-- game.test.html -->
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Water Sort Puzzle Tests</title>
  <style>
    body { font-family: monospace; padding: 20px; }
    h2 { margin-bottom: 12px; }
  </style>
</head>
<body>
  <div id="test-results"></div>
  <script src="test-runner.js"></script>
  <script src="game.js"></script>
  <script src="levels.js"></script>
  <script src="game.test.js"></script>
</body>
</html>
```

- [ ] **Step 3: 空のテストファイルと空のソースを作成**

```javascript
// game.test.js
const { describe, it, assert, assertEqual, render } = TestRunner;

// テストはここに追加していく

render();
```

```javascript
// game.js
// Water Sort Puzzle — ゲームロジック
```

```javascript
// levels.js
// レベルデータ
const LEVELS = [];
```

- [ ] **Step 4: ブラウザで game.test.html を開いてテストランナーが動作することを確認**

ブラウザで開き、「Tests: 0 passed, 0 failed」と表示されればOK。

- [ ] **Step 5: コミット**

```bash
git add test-runner.js game.test.js game.test.html game.js levels.js
git commit -m "feat: テストランナーとファイル構成のセットアップ"
```

---

### Task 2: ゲーム状態の初期化

**Files:**
- Modify: `game.js`
- Modify: `game.test.js`

- [ ] **Step 1: 失敗するテストを書く**

```javascript
// game.test.js に追加（render() の前に）
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
```

- [ ] **Step 2: テストを実行して失敗を確認**

ブラウザで game.test.html を開く。「createGameState is not defined」で失敗。

- [ ] **Step 3: 実装**

```javascript
// game.js
function createGameState(level) {
  return {
    tubes: level.map(tube => [...tube]),
    moves: 0,
    selectedTube: -1,
    history: [],
  };
}
```

- [ ] **Step 4: テストを実行してパスを確認**

ブラウザリロード。2件パス。

- [ ] **Step 5: コミット**

```bash
git add game.js game.test.js
git commit -m "feat: createGameState でレベルからゲーム状態を初期化"
```

---

### Task 3: 移動の判定ロジック（canMove）

**Files:**
- Modify: `game.js`
- Modify: `game.test.js`

- [ ] **Step 1: 失敗するテストを書く**

```javascript
// game.test.js に追加
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
```

- [ ] **Step 2: テストを実行して失敗を確認**

- [ ] **Step 3: 実装**

```javascript
// game.js に追加
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
```

- [ ] **Step 4: テストを実行してパスを確認**

- [ ] **Step 5: コミット**

```bash
git add game.js game.test.js
git commit -m "feat: canMove で移動可否の判定"
```

---

### Task 4: 液体の移動実行（executeMove）

**Files:**
- Modify: `game.js`
- Modify: `game.test.js`

- [ ] **Step 1: 失敗するテストを書く**

```javascript
// game.test.js に追加
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
```

- [ ] **Step 2: テストを実行して失敗を確認**

- [ ] **Step 3: 実装**

```javascript
// game.js に追加
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
```

- [ ] **Step 4: テストを実行してパスを確認**

- [ ] **Step 5: コミット**

```bash
git add game.js game.test.js
git commit -m "feat: executeMove で液体の移動実行"
```

---

### Task 5: Undo機能

**Files:**
- Modify: `game.js`
- Modify: `game.test.js`

- [ ] **Step 1: 失敗するテストを書く**

```javascript
// game.test.js に追加
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
```

- [ ] **Step 2: テストを実行して失敗を確認**

- [ ] **Step 3: 実装**

```javascript
// game.js に追加
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
```

- [ ] **Step 4: テストを実行してパスを確認**

- [ ] **Step 5: コミット**

```bash
git add game.js game.test.js
git commit -m "feat: undo で直前の操作を取り消し"
```

---

### Task 6: クリア判定（isSolved）

**Files:**
- Modify: `game.js`
- Modify: `game.test.js`

- [ ] **Step 1: 失敗するテストを書く**

```javascript
// game.test.js に追加
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
```

- [ ] **Step 2: テストを実行して失敗を確認**

- [ ] **Step 3: 実装**

```javascript
// game.js に追加
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
```

- [ ] **Step 4: テストを実行してパスを確認**

- [ ] **Step 5: コミット**

```bash
git add game.js game.test.js
git commit -m "feat: isSolved でクリア判定"
```

---

### Task 7: タップ操作のハンドリング（handleTap）

**Files:**
- Modify: `game.js`
- Modify: `game.test.js`

- [ ] **Step 1: 失敗するテストを書く**

```javascript
// game.test.js に追加
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

  it('選択中に移動不可な空の試験管以外をタップすると選択切り替え', () => {
    const state = createGameState([["red"], ["blue", "blue", "blue", "blue", "blue"]]);
    state.selectedTube = 0;
    const newState = handleTap(state, 1);
    assertEqual(newState.selectedTube, 1);
  });
});
```

- [ ] **Step 2: テストを実行して失敗を確認**

- [ ] **Step 3: 実装**

```javascript
// game.js に追加
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
```

- [ ] **Step 4: テストを実行してパスを確認**

- [ ] **Step 5: コミット**

```bash
git add game.js game.test.js
git commit -m "feat: handleTap でタップ操作を統合管理"
```

---

### Task 8: レベルデータの作成（levels.js）

**Files:**
- Modify: `levels.js`
- Modify: `game.test.js`

- [ ] **Step 1: 失敗するテストを書く**

```javascript
// game.test.js に追加
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
```

- [ ] **Step 2: テストを実行して失敗を確認**

- [ ] **Step 3: レベルデータを実装**

`levels.js` に30レベル分のデータを定義する。パステル系の色名を使用：

```javascript
// levels.js
const COLORS = {
  pink: '#F2A6B3',
  sky: '#87CEEB',
  mint: '#98E8C1',
  peach: '#FFCBA4',
  lilac: '#C8A2C8',
  lemon: '#FFF44F',
  coral: '#FF7F7F',
};

const C = COLORS;

const LEVELS = [
  // Level 1 (3色: pink, sky, mint)
  [
    ["pink", "sky", "mint", "pink", "sky"],
    ["mint", "pink", "sky", "mint", "pink"],
    ["sky", "mint", "sky", "pink", "mint"],
    [],
    [],
  ],
  // Level 2
  [
    ["sky", "mint", "pink", "sky", "mint"],
    ["pink", "sky", "mint", "pink", "mint"],
    ["mint", "pink", "sky", "sky", "pink"],
    [],
    [],
  ],
  // Level 3
  [
    ["mint", "pink", "sky", "mint", "sky"],
    ["sky", "mint", "pink", "sky", "pink"],
    ["pink", "sky", "mint", "pink", "mint"],
    [],
    [],
  ],
  // Level 4
  [
    ["pink", "mint", "sky", "pink", "mint"],
    ["sky", "pink", "mint", "sky", "mint"],
    ["mint", "sky", "pink", "sky", "pink"],
    [],
    [],
  ],
  // Level 5
  [
    ["sky", "pink", "mint", "sky", "pink"],
    ["mint", "sky", "pink", "mint", "sky"],
    ["pink", "mint", "sky", "pink", "mint"],
    [],
    [],
  ],
  // Level 6 (4色: pink, sky, mint, peach)
  [
    ["pink", "sky", "mint", "peach", "pink"],
    ["peach", "mint", "sky", "pink", "mint"],
    ["sky", "peach", "pink", "mint", "peach"],
    ["mint", "pink", "peach", "sky", "sky"],
    [],
    [],
  ],
  // Level 7
  [
    ["mint", "peach", "pink", "sky", "mint"],
    ["sky", "pink", "peach", "mint", "sky"],
    ["peach", "sky", "mint", "pink", "peach"],
    ["pink", "mint", "sky", "peach", "pink"],
    [],
    [],
  ],
  // Level 8
  [
    ["peach", "pink", "sky", "mint", "peach"],
    ["mint", "sky", "peach", "pink", "sky"],
    ["pink", "mint", "pink", "sky", "peach"],
    ["sky", "peach", "mint", "pink", "mint"],
    [],
    [],
  ],
  // Level 9
  [
    ["sky", "mint", "peach", "pink", "sky"],
    ["pink", "peach", "sky", "mint", "pink"],
    ["mint", "sky", "pink", "peach", "mint"],
    ["peach", "pink", "mint", "sky", "peach"],
    [],
    [],
  ],
  // Level 10
  [
    ["peach", "sky", "pink", "mint", "peach"],
    ["mint", "pink", "peach", "sky", "mint"],
    ["pink", "mint", "sky", "peach", "sky"],
    ["sky", "peach", "mint", "pink", "pink"],
    [],
    [],
  ],
  // Level 11
  [
    ["mint", "peach", "sky", "pink", "mint"],
    ["sky", "pink", "mint", "peach", "pink"],
    ["peach", "mint", "pink", "sky", "peach"],
    ["pink", "sky", "peach", "mint", "sky"],
    [],
    [],
  ],
  // Level 12
  [
    ["pink", "sky", "peach", "mint", "pink"],
    ["peach", "mint", "pink", "sky", "peach"],
    ["sky", "peach", "mint", "pink", "mint"],
    ["mint", "pink", "sky", "peach", "sky"],
    [],
    [],
  ],
  // Level 13 (5色: pink, sky, mint, peach, lilac)
  [
    ["pink", "sky", "mint", "peach", "lilac"],
    ["lilac", "peach", "sky", "pink", "mint"],
    ["mint", "lilac", "peach", "sky", "pink"],
    ["peach", "mint", "lilac", "pink", "sky"],
    ["sky", "pink", "mint", "lilac", "peach"],
    [],
    [],
  ],
  // Level 14
  [
    ["lilac", "mint", "pink", "sky", "peach"],
    ["sky", "peach", "lilac", "mint", "pink"],
    ["peach", "pink", "sky", "lilac", "mint"],
    ["mint", "sky", "peach", "pink", "lilac"],
    ["pink", "lilac", "mint", "peach", "sky"],
    [],
    [],
  ],
  // Level 15
  [
    ["mint", "lilac", "peach", "pink", "sky"],
    ["pink", "sky", "mint", "lilac", "peach"],
    ["sky", "peach", "lilac", "mint", "pink"],
    ["lilac", "mint", "pink", "peach", "sky"],
    ["peach", "pink", "sky", "sky", "lilac"],
    [],
    [],
  ],
  // Level 16
  [
    ["peach", "pink", "lilac", "sky", "mint"],
    ["sky", "lilac", "mint", "peach", "pink"],
    ["mint", "peach", "sky", "pink", "lilac"],
    ["lilac", "sky", "pink", "mint", "peach"],
    ["pink", "mint", "peach", "lilac", "sky"],
    [],
    [],
  ],
  // Level 17
  [
    ["sky", "peach", "pink", "lilac", "mint"],
    ["lilac", "mint", "sky", "peach", "pink"],
    ["pink", "sky", "lilac", "mint", "peach"],
    ["mint", "lilac", "peach", "pink", "sky"],
    ["peach", "pink", "mint", "sky", "lilac"],
    [],
    [],
  ],
  // Level 18
  [
    ["lilac", "sky", "peach", "mint", "pink"],
    ["mint", "pink", "lilac", "sky", "peach"],
    ["peach", "lilac", "pink", "mint", "sky"],
    ["sky", "mint", "peach", "pink", "lilac"],
    ["pink", "peach", "sky", "lilac", "mint"],
    [],
    [],
  ],
  // Level 19
  [
    ["pink", "lilac", "sky", "peach", "mint"],
    ["peach", "mint", "pink", "lilac", "sky"],
    ["sky", "pink", "peach", "mint", "lilac"],
    ["mint", "peach", "lilac", "sky", "pink"],
    ["lilac", "sky", "mint", "pink", "peach"],
    [],
    [],
  ],
  // Level 20
  [
    ["mint", "peach", "lilac", "pink", "sky"],
    ["sky", "lilac", "pink", "peach", "mint"],
    ["lilac", "mint", "sky", "pink", "peach"],
    ["pink", "sky", "peach", "mint", "lilac"],
    ["peach", "pink", "mint", "lilac", "sky"],
    [],
    [],
  ],
  // Level 21 (6色: pink, sky, mint, peach, lilac, lemon)
  [
    ["pink", "sky", "mint", "peach", "lilac"],
    ["lemon", "lilac", "peach", "sky", "pink"],
    ["mint", "lemon", "lilac", "peach", "sky"],
    ["peach", "mint", "lemon", "pink", "lilac"],
    ["sky", "pink", "mint", "lemon", "peach"],
    ["lilac", "peach", "sky", "mint", "lemon"],
    [],
    [],
  ],
  // Level 22
  [
    ["lemon", "mint", "pink", "sky", "lilac"],
    ["sky", "lilac", "lemon", "peach", "mint"],
    ["peach", "pink", "sky", "lilac", "lemon"],
    ["lilac", "lemon", "peach", "mint", "pink"],
    ["mint", "peach", "lilac", "lemon", "sky"],
    ["pink", "sky", "mint", "pink", "peach"],
    [],
    [],
  ],
  // Level 23
  [
    ["lilac", "lemon", "peach", "pink", "sky"],
    ["mint", "sky", "lilac", "lemon", "peach"],
    ["pink", "peach", "mint", "sky", "lemon"],
    ["sky", "lilac", "pink", "peach", "mint"],
    ["lemon", "mint", "sky", "lilac", "pink"],
    ["peach", "pink", "lemon", "mint", "lilac"],
    [],
    [],
  ],
  // Level 24
  [
    ["peach", "lilac", "sky", "lemon", "mint"],
    ["lemon", "pink", "mint", "lilac", "peach"],
    ["sky", "mint", "lemon", "pink", "lilac"],
    ["mint", "peach", "pink", "sky", "lemon"],
    ["pink", "lemon", "lilac", "peach", "sky"],
    ["lilac", "sky", "peach", "mint", "pink"],
    [],
    [],
  ],
  // Level 25
  [
    ["sky", "peach", "lemon", "mint", "lilac"],
    ["pink", "lilac", "sky", "peach", "lemon"],
    ["mint", "lemon", "pink", "lilac", "peach"],
    ["lilac", "mint", "peach", "sky", "pink"],
    ["lemon", "sky", "mint", "pink", "peach"],
    ["peach", "pink", "lilac", "lemon", "sky"],
    [],
    [],
  ],
  // Level 26
  [
    ["mint", "sky", "lilac", "peach", "lemon"],
    ["peach", "lemon", "pink", "mint", "sky"],
    ["lilac", "peach", "lemon", "sky", "pink"],
    ["lemon", "pink", "sky", "lilac", "mint"],
    ["sky", "mint", "peach", "pink", "lilac"],
    ["pink", "lilac", "mint", "lemon", "peach"],
    [],
    [],
  ],
  // Level 27
  [
    ["lemon", "lilac", "mint", "sky", "peach"],
    ["sky", "peach", "lemon", "pink", "lilac"],
    ["pink", "mint", "sky", "lilac", "lemon"],
    ["peach", "lemon", "lilac", "mint", "pink"],
    ["lilac", "pink", "peach", "lemon", "sky"],
    ["mint", "sky", "pink", "peach", "mint"],
    [],
    [],
  ],
  // Level 28 (7色: pink, sky, mint, peach, lilac, lemon, coral)
  [
    ["pink", "sky", "mint", "peach", "lilac"],
    ["lemon", "coral", "lilac", "sky", "pink"],
    ["mint", "lemon", "coral", "peach", "sky"],
    ["peach", "lilac", "lemon", "coral", "mint"],
    ["coral", "pink", "mint", "lemon", "peach"],
    ["sky", "peach", "pink", "mint", "coral"],
    ["lilac", "mint", "peach", "sky", "lemon"],
    [],
    [],
  ],
  // Level 29
  [
    ["coral", "mint", "pink", "lemon", "lilac"],
    ["sky", "lilac", "coral", "peach", "mint"],
    ["peach", "lemon", "sky", "coral", "pink"],
    ["lilac", "coral", "peach", "mint", "lemon"],
    ["mint", "pink", "lemon", "sky", "peach"],
    ["lemon", "peach", "lilac", "pink", "sky"],
    ["pink", "sky", "mint", "lilac", "coral"],
    [],
    [],
  ],
  // Level 30
  [
    ["lilac", "coral", "lemon", "sky", "mint"],
    ["pink", "mint", "lilac", "coral", "peach"],
    ["sky", "lemon", "peach", "pink", "coral"],
    ["mint", "peach", "sky", "lilac", "lemon"],
    ["coral", "pink", "mint", "lemon", "sky"],
    ["peach", "lilac", "coral", "pink", "mint"],
    ["lemon", "sky", "pink", "peach", "lilac"],
    [],
    [],
  ],
];
```

各色がちょうど5個ずつであることを確認しながら手動で配置する。

- [ ] **Step 4: テストを実行してパスを確認**

- [ ] **Step 5: コミット**

```bash
git add levels.js game.test.js
git commit -m "feat: 30レベル分のレベルデータを作成"
```

---

### Task 9: ゲーム画面のHTML/CSS

**Files:**
- Create: `index.html`
- Create: `style.css`

- [ ] **Step 1: HTMLを作成**

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Water Sort Puzzle</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- レベル選択画面 -->
  <div id="level-select-screen" class="screen">
    <h1>Water Sort Puzzle</h1>
    <div id="level-grid" class="level-grid"></div>
  </div>

  <!-- ゲーム画面 -->
  <div id="game-screen" class="screen hidden">
    <div class="game-header">
      <span id="level-label">Level 1</span>
      <span id="moves-label">Moves: 0</span>
    </div>
    <div id="tubes-container" class="tubes-container"></div>
    <div class="game-controls">
      <button id="undo-btn" class="btn">↩ Undo</button>
      <button id="restart-btn" class="btn">🔄 Restart</button>
      <button id="back-btn" class="btn">◁ Back</button>
    </div>
  </div>

  <!-- クリアオーバーレイ -->
  <div id="clear-overlay" class="overlay hidden">
    <div class="overlay-content">
      <h2>🎉 クリア！</h2>
      <p id="clear-moves"></p>
      <button id="next-level-btn" class="btn btn-primary">次のレベルへ →</button>
      <button id="back-to-levels-btn" class="btn">レベル選択に戻る</button>
    </div>
  </div>

  <script src="levels.js"></script>
  <script src="game.js"></script>
</body>
</html>
```

- [ ] **Step 2: CSSを作成**

```css
/* style.css */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f5f7;
  color: #333;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.screen { width: 100%; max-width: 480px; padding: 20px; }
.hidden { display: none !important; }

/* レベル選択画面 */
h1 {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #333;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.level-btn {
  aspect-ratio: 1;
  border: none;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-size: 16px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
}

.level-btn:hover { transform: scale(1.05); }
.level-btn.cleared { color: #4CAF50; }
.level-btn.cleared::after { content: ' ✓'; font-size: 12px; }

/* ゲーム画面 */
.game-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
}

.tubes-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  min-height: 200px;
  align-items: flex-end;
  padding: 20px 0;
}

.tube {
  width: 44px;
  display: flex;
  flex-direction: column-reverse;
  border: 2px solid #ccc;
  border-top: none;
  border-radius: 0 0 10px 10px;
  height: 162px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.15s;
  overflow: hidden;
}

.tube.selected {
  transform: translateY(-12px);
  border-color: #666;
}

.liquid {
  width: 100%;
  height: 30px;
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.15s;
}

.btn:hover { transform: scale(1.05); }
.btn-primary { background: #4CAF50; color: white; }

/* クリアオーバーレイ */
.overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.overlay-content {
  background: white;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.overlay-content h2 { font-size: 28px; margin-bottom: 8px; }
.overlay-content p { margin-bottom: 20px; color: #666; }
.overlay-content .btn { display: block; width: 100%; margin-top: 10px; }
```

- [ ] **Step 3: ブラウザで index.html を開いて表示を確認**

空のゲーム画面の構造が正しく表示されることを確認。

- [ ] **Step 4: コミット**

```bash
git add index.html style.css
git commit -m "feat: ゲーム画面のHTML/CSSレイアウト"
```

---

### Task 10: UI描画ロジック（game.jsにDOM操作を追加）

**Files:**
- Modify: `game.js`

- [ ] **Step 1: レベル選択画面の描画を実装**

```javascript
// game.js に追加

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
```

- [ ] **Step 2: ゲーム画面の描画を実装**

```javascript
// game.js に追加

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
```

- [ ] **Step 3: ゲーム操作のイベントハンドラを実装**

```javascript
// game.js に追加

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
  renderLevelSelect();
  showScreen('level-select-screen');

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
```

- [ ] **Step 4: ブラウザで index.html を開いて動作を確認**

レベル1を選択 → 試験管が表示される → クリックで選択・移動ができる → Undo/Restart/Backが動く。

- [ ] **Step 5: コミット**

```bash
git add game.js
git commit -m "feat: UI描画とイベントハンドリング"
```

---

### Task 11: 統合テスト

**Files:**
- Modify: `game.test.js`

- [ ] **Step 1: 統合テストを追加**

```javascript
// game.test.js に追加
describe('統合テスト: ゲームフロー', () => {
  it('レベル開始からクリアまでの一連のフロー', () => {
    // 簡単な2色レベルを手動で定義してテスト
    const simpleLevel = [
      ["red", "blue"],
      ["blue", "red"],
      [],
    ];
    let state = createGameState(simpleLevel);

    // red を空の試験管に移動
    state = handleTap(state, 0);  // select tube 0
    assertEqual(state.selectedTube, 0);
    state = handleTap(state, 2);  // move to tube 2
    assertEqual(state.tubes[0], ["red"]);
    assertEqual(state.tubes[2], ["blue"]);
    assertEqual(state.moves, 1);

    // tube 1 の red を tube 2 に → 不可（blue の上に red）
    state = handleTap(state, 1);
    assertEqual(state.selectedTube, 1);
    state = handleTap(state, 2);
    // 移動不可なので選択が解除されない → 空でないので切り替わる
    // tube 2 の top は blue, tube 1 の top は red → canMove false → 選択切り替え
    assertEqual(state.selectedTube, 2);

    // tube 2 の blue を tube 0 に移動（red の上に blue は不可）
    state = handleTap(state, 0);
    // blue vs red → 不可 → 選択切り替え
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
```

- [ ] **Step 2: テストを実行してパスを確認**

- [ ] **Step 3: コミット**

```bash
git add game.test.js
git commit -m "test: ゲームフローの統合テスト"
```

---

### Task 12: ブラウザ動作確認とバグ修正

**Files:**
- 修正が必要なファイルは動作確認で判明

- [ ] **Step 1: ブラウザで全画面フローを確認**

1. `index.html` を開く
2. レベル選択画面が表示される
3. レベル1をクリック → ゲーム画面に切り替わる
4. 試験管をクリック → 選択（上に持ち上がる）
5. 別の試験管をクリック → 液体が移動する
6. Undoボタン → 戻る
7. Restartボタン → 最初に戻る
8. Backボタン → レベル選択に戻る
9. レベルをクリアする → クリアオーバーレイが表示される
10. 次のレベルへ → 次のレベルが始まる
11. レベル選択に戻る → クリア済みにチェックマークが付いている

- [ ] **Step 2: 発見したバグがあれば修正**

- [ ] **Step 3: コミット**

```bash
git add -A
git commit -m "fix: ブラウザ動作確認で発見したバグを修正"
```
