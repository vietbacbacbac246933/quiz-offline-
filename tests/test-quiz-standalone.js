'use strict';
const assert = require('assert');
const vm = require('vm');
require('../public/quiz-core.js');
const core = globalThis.QuizCore;

const exam = core.validateExam({
  id: 'sample-vi', title: 'Ôn tập tiếng Việt',
  questions: [
    { text: 'Thủ đô Việt Nam?', options: ['Huế', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'], answer: 1 },
    { text: '2 + 2 = ?', options: ['3', '4', '5', '6'], answer: 1 },
    { text: 'Ký hiệu α < β?', options: ['Sai', 'Đúng', 'Không rõ', 'Khác'], answer: 1 },
    { text: 'Câu 4', options: ['A', 'B', 'C', 'D'], answer: 2 },
    { text: 'Câu 5', options: ['A', 'B', 'C', 'D'], answer: 0 }
  ]
});
const html = core.standalone(exam);
assert.ok(!html.includes('https://') && !html.includes('<script src='));
const marker = '<script>'; const start = html.lastIndexOf(marker);
const end = html.lastIndexOf('</script></html>');
assert.ok(start >= 0 && end > start);
const appSource = html.slice(start + marker.length, end);
new Function(appSource);

const storage = new Map();
function page() {
  const elements = Object.create(null), radios = Object.create(null), anchors = [];
  function element(id) {
    if (!elements[id]) elements[id] = {
      id, value: '', textContent: '', checked: false, innerHTML: '', children: [],
      listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; },
      append(...items) { this.children.push(...items); },
      click() { if (this.onclick) this.onclick(); }
    };
    return elements[id];
  }
  exam.questions.forEach((_, i) => exam.questions[i].options.forEach((__, j) => {
    radios[`[name="q${i}"][value="${j}"]`] = { name: `q${i}`, value: String(j), checked: false };
  }));
  const document = {
    querySelector(selector) {
      if (selector === '#exam') return { textContent: JSON.stringify(exam) };
      if (selector[0] === '#') return element(selector.slice(1));
      return radios[selector] || null;
    },
    createElement(tag) { const el = element(`created-${anchors.length}`); el.tagName = tag; anchors.push(el); return el; }
  };
  const context = {
    document, localStorage: { getItem: k => storage.get(k) || null, setItem: (k, v) => storage.set(k, v) },
    crypto: { randomUUID: () => 'attempt-unique-1' }, Date, Math, Blob,
    URL: { createObjectURL: () => 'blob:result' }
  };
  vm.runInNewContext(appSource, context);
  return { elements, radios, anchors };
}

let p = page();
p.elements.student.value = 'Nguyễn An'; p.elements.class.value = '10A';
const chosen = p.radios['[name="q0"][value="1"]']; chosen.checked = true;
p.elements.questions.listeners.change({ target: chosen });
p = page();
assert.equal(p.elements.student.value, 'Nguyễn An');
assert.equal(p.radios['[name="q0"][value="1"]'].checked, true);
p.elements.submit.click();
assert.equal(p.elements.result.textContent, 'Kết quả: 1/5');
assert.equal(JSON.parse(storage.get('quiz-last-result:sample-vi')).answers[0], 1);
assert.equal(p.anchors.find(x => x.download).download, 'ket-qua-attempt-unique-1.json');
console.log('quiz-standalone logic: 8 assertions passed (DOM shim; not a real browser).');

