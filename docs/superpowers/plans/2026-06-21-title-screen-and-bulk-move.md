# Water Water Color — タイトル画面 & まとめて移動 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** タイトル画面の追加と、上から連続した同じ色の液体をまとめて移動できる機能の実装。

**Architecture:** 最小変更。既存4ファイル構成（index.html / style.css / game.js / levels.js）を維持し、game.jsに`countMovable`関数を追加・`executeMove`を更新、index.htmlにタイトル画面divを追加する。テストはブラウザ上で動く既存のgame.test.htmlで実行する。

**Tech Stack:** HTML / CSS / Vanilla JavaScript。テストランナー: 独自（test-runner.js）。ブラウザ起動: `bash start.sh` で localhost:8080。

## Global Constraints

- フレームワーク不使用。HTML/CSS/JSのみ。
- ゲーム名は「Water Water Color」（index.html `<title>` とタイトル画面h1に反映）
- TUBE_CAPACITY = 5（試験管の最大容量）
- テストファイル: game.test.js（ユニット＋IT）、実行: ブラウザで http://localhost:8080/game.test.html を開く
- TDD: テスト先行（Red → Green → Refactor）
- 各タスクの最後にgit commit

---

## ファイル構成

| ファイル | 変更内容 |
|----------|----------|
| `game.js` | `countMovable` 関数追加（`executeMove`の前に配置）、`executeMove` をまとめ移動対応に変更、`init()` をタイトル画面から始まるよう更新 |
| `game.test.js` | `countMovable` ユニットテスト、`executeMove` まとめ移動テスト、まとめ移動IT、タイトル画面DOMテスト を追加 |
| `game.test.html` | `<title>` をWater Water Colorに変更、DOM IT用のHTML要素セクションを追加 |
| `index.html` | `#title-screen` div追加、`<title>` をWater Water Colorに変更 |
| `style.css` | タイトル画面用スタイル追加 |

---

## Task 1: `countMovable` 関数の追加

**Files:**
- Modify: `game.test.js`（テスト追加）
- Modify: `game.js`（関数追加）

**Interfaces:**
- Produces: `countMovable(tubes, fromIndex)` → `number` — 試験管の上から連続する同じ色の個数を返す

- [ ] **Step 1: テストを書く**

`game.test.js` の `describe('executeMove', ...)` ブロックの**前**に以下を追加する:

```js
describe('countMovable', () => {
  it('上から同じ色が3個連続している場合は3を返す', () => {
    const tubes = [["red", "blue", "blue", "blue"]];
    assertEqual(countMovable(tubes, 0), 3);
  });

  it('上から1個だけ同じ色の場合は1を返す', () => {
    const tubes = [["red", "blue"]];
    assertEqual(countMovable(tubes, 0), 1);
  });

  it('空の試験管は0を返す', () => {
    const tubes = [[]];
    assertEqual(countMovable(tubes, 0), 0);
  });

  it('全部同じ色の場合は全個数を返す', () => {
    const tubes = [["red", "red", "red", "red", "red"]];
    assertEqual(countMovable(tubes, 0), 5);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認する**

ブラウザで http://localhost:8080/game.test.html を開く（サーバーが止まっていたら `bash start.sh` で起動）。
期待: `countMovable > ...` が赤（✗）で表示される。`countMovable is not defined` のようなエラー。

- [ ] **Step 3: 関数を実装する**

`game.js` の `const TUBE_CAPACITY = 5;` の直後、`function canMove(...)` の**前**に以下を追加する:

```js
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
```

- [ ] **Step 4: テストが通ることを確認する**

ブラウザをリロードして http://localhost:8080/game.test.html を確認。
期待: `countMovable > ...` が全て緑（✓）で表示される。他のテストも引き続き全て緑。

- [ ] **Step 5: コミット**

```bash
git add game.js game.test.js
git commit -m "feat: countMovable で上から連続する同色の個数を取得"
```

---

## Task 2: `executeMove` のまとめ移動対応

**Files:**
- Modify: `game.test.js`（テスト追加）
- Modify: `game.js`（`executeMove` 更新）

**Interfaces:**
- Consumes: `countMovable(tubes, fromIndex)` → `number`（Task 1 で実装済み）
- Produces: `executeMove(state, fromIndex, toIndex)` → `state` — 上から連続する同じ色をまとめて（移動先の空きの範囲内で）移動する

- [ ] **Step 1: テストを書く**

`game.test.js` の `describe('executeMove', ...)` ブロックの**中**に以下のテストを追加する（既存テストの最後に追加）:

```js
  it('上から同じ色が2個連続している場合は2個まとめて移動する', () => {
    const state = createGameState([["red", "blue", "blue"], ["green", "blue"]]);
    const newState = executeMove(state, 0, 1);
    assertEqual(newState.tubes[0], ["red"]);
    assertEqual(newState.tubes[1], ["green", "blue", "blue", "blue"]);
    assertEqual(newState.moves, 1);
  });

  it('移動先の空きが足りない場合は空きの分だけ移動する', () => {
    // tube 0: ["red", "blue", "blue", "blue"] (上から "blue" が3個)
    // tube 1: ["a", "b", "blue"] (空き = 5 - 3 = 2)
    // min(3, 2) = 2 個だけ移動する
    const state = createGameState([["red", "blue", "blue", "blue"], ["a", "b", "blue"]]);
    const newState = executeMove(state, 0, 1);
    assertEqual(newState.tubes[0], ["red", "blue"]);
    assertEqual(newState.tubes[1], ["a", "b", "blue", "blue", "blue"]);
    assertEqual(newState.moves, 1);
  });

  it('Undoでまとめ移動も元に戻る', () => {
    const state = createGameState([["red", "blue", "blue"], ["green", "blue"]]);
    const moved = executeMove(state, 0, 1);
    const undone = undo(moved);
    assertEqual(undone.tubes[0], ["red", "blue", "blue"]);
    assertEqual(undone.tubes[1], ["green", "blue"]);
    assertEqual(undone.moves, 0);
  });
```

また、`describe('統合テスト: ゲームフロー', ...)` ブロックの**後**（`render()` の前）に以下のITを追加する:

```js
describe('統合テスト: まとめ移動', () => {
  it('同じ色が積み重なった試験管をタップすると全部まとめて移動する', () => {
    const level = [
      ["blue", "red", "red"],
      ["red", "blue", "blue"],
      [],
    ];
    let state = createGameState(level);

    // tube 0 の上2個は "red" → tube 2（空）にまとめて移動
    state = handleTap(state, 0);
    state = handleTap(state, 2);
    assertEqual(state.tubes[0], ["blue"]);
    assertEqual(state.tubes[2], ["red", "red"]);
    assertEqual(state.moves, 1);

    // tube 1 の上2個は "blue" → tube 0（"blue" の上）にまとめて移動
    state = handleTap(state, 1);
    state = handleTap(state, 0);
    assertEqual(state.tubes[0], ["blue", "blue", "blue"]);
    assertEqual(state.tubes[1], ["red"]);
    assertEqual(state.moves, 2);

    // tube 1 の "red" → tube 2（"red" の上）
    state = handleTap(state, 1);
    state = handleTap(state, 2);
    assertEqual(state.tubes[1], []);
    assertEqual(state.tubes[2], ["red", "red", "red"]);
    assertEqual(state.moves, 3);

    assert(isSolved(state.tubes) === true);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認する**

ブラウザをリロードして http://localhost:8080/game.test.html を確認。
期待: 追加した3つのユニットテストと統合テストが赤（✗）で表示される。
既存テストは引き続き全て緑（変更前の1個移動テストは通る）。

- [ ] **Step 3: `executeMove` を更新する**

`game.js` の `executeMove` 関数全体を以下に置き換える:

```js
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
```

- [ ] **Step 4: テストが通ることを確認する**

ブラウザをリロードして http://localhost:8080/game.test.html を確認。
期待: 全テストが緑（✓）。追加したテストも含めて全件パス。

- [ ] **Step 5: コミット**

```bash
git add game.js game.test.js
git commit -m "feat: executeMove で同色液体をまとめて移動"
```

---

## Task 3: タイトル画面の実装

**Files:**
- Modify: `game.test.html`（タイトル更新、DOM IT用要素追加）
- Modify: `game.test.js`（DOM統合テスト追加）
- Modify: `index.html`（タイトル画面div追加、ゲーム名更新）
- Modify: `style.css`（タイトル画面スタイル追加）
- Modify: `game.js`（`init()` をタイトル画面スタートに変更）

**Interfaces:**
- Consumes: `showScreen(screenId)` — 既存関数（`.screen` 全てに `hidden` を付け、指定IDだけ外す）
- Produces: タイトル画面 → レベル選択画面 の遷移フロー

- [ ] **Step 1: DOM ITのテストを書く**

まず `game.test.html` を開き、`<div id="test-results"></div>` の直後に以下を追加する:

```html
<!-- DOM IT用: 画面遷移テストのための最小HTML構造 -->
<div style="display:none">
  <div id="title-screen" class="screen">
    <button id="start-btn">スタート</button>
  </div>
  <div id="level-select-screen" class="screen hidden"></div>
  <div id="game-screen" class="screen hidden">
    <span id="level-label"></span>
    <span id="moves-label"></span>
    <div id="tubes-container"></div>
    <button id="undo-btn"></button>
    <button id="restart-btn"></button>
    <button id="back-btn"></button>
  </div>
  <div id="clear-overlay" class="hidden">
    <p id="clear-moves"></p>
    <button id="next-level-btn"></button>
    <button id="back-to-levels-btn"></button>
  </div>
  <div id="level-grid"></div>
</div>
```

また `<title>Water Sort Puzzle Tests</title>` を `<title>Water Water Color Tests</title>` に変更する。

次に `game.test.js` の `render()` の直前に以下を追加する:

```js
describe('統合テスト: タイトル画面', () => {
  it('init後にタイトル画面が最初に表示される', () => {
    init();
    const titleScreen = document.getElementById('title-screen');
    assert(!titleScreen.classList.contains('hidden'), 'タイトル画面が表示されている');
    const levelSelectScreen = document.getElementById('level-select-screen');
    assert(levelSelectScreen.classList.contains('hidden'), 'レベル選択画面が非表示');
  });

  it('スタートボタンを押すとレベル選択画面に遷移する', () => {
    init();
    document.getElementById('start-btn').click();
    const levelSelectScreen = document.getElementById('level-select-screen');
    assert(!levelSelectScreen.classList.contains('hidden'), 'レベル選択画面が表示されている');
    const titleScreen = document.getElementById('title-screen');
    assert(titleScreen.classList.contains('hidden'), 'タイトル画面が非表示になっている');
  });
});
```

- [ ] **Step 2: テストが失敗することを確認する**

ブラウザをリロードして http://localhost:8080/game.test.html を確認。
期待: `統合テスト: タイトル画面 > init後にタイトル画面が最初に表示される` が赤（✗）。
理由: 現状の `init()` は `showScreen('level-select-screen')` を呼ぶため、タイトル画面に `hidden` が付いてしまう。

- [ ] **Step 3: `index.html` にタイトル画面を追加し、ゲーム名を更新する**

`index.html` の `<title>Water Sort Puzzle</title>` を以下に変更:

```html
<title>Water Water Color</title>
```

`index.html` の `<!-- レベル選択画面 -->` コメントの**前**に以下を追加:

```html
<!-- タイトル画面 -->
<div id="title-screen" class="screen">
  <h1>Water Water Color</h1>
  <button id="start-btn" class="btn btn-primary">スタート</button>
</div>
```

- [ ] **Step 4: `game.js` の `init()` を更新する**

`game.js` の `init()` 関数の先頭2行を以下に変更する:

変更前:
```js
function init() {
  renderLevelSelect();
  showScreen('level-select-screen');
```

変更後:
```js
function init() {
  showScreen('title-screen');

  document.getElementById('start-btn').addEventListener('click', () => {
    renderLevelSelect();
    showScreen('level-select-screen');
  });
```

- [ ] **Step 5: `style.css` にタイトル画面スタイルを追加する**

`style.css` の末尾に以下を追加する:

```css
#title-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  min-height: 60vh;
}
```

- [ ] **Step 6: テストが通ることを確認する**

ブラウザをリロードして http://localhost:8080/game.test.html を確認。
期待: 全テストが緑（✓）。`統合テスト: タイトル画面` の2テストも含めて全件パス。

- [ ] **Step 7: ゲーム画面で動作を目視確認する**

http://localhost:8080/index.html をブラウザで開く。
確認項目:
- [ ] タイトル「Water Water Color」とスタートボタンが表示される
- [ ] スタートボタンを押すとレベル選択画面に遷移する
- [ ] レベルをクリックするとゲーム画面に遷移する
- [ ] ゲーム中に同じ色が重なった試験管をタップすると複数まとめて移動する
- [ ] Undoが正常に動作する

- [ ] **Step 8: コミット**

```bash
git add index.html style.css game.js game.test.html game.test.js
git commit -m "feat: タイトル画面を追加、ゲーム名をWater Water Colorに変更"
```
