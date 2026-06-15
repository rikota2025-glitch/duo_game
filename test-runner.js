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
