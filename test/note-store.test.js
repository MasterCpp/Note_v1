const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { NoteStore } = require('../src/note-store');

function createStore() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-index-test-'));
  return { directory, store: new NoteStore(path.join(directory, 'notes.json')) };
}

test('a parent note completes automatically after every child is completed', () => {
  const { store } = createStore();
  const parent = store.createNote('做桌面灵感挂件');
  const firstChild = store.createChild(parent.id, '画页面原型');
  const secondChild = store.createChild(parent.id, '打包 Windows 安装包');

  assert.equal(store.toggleNote(parent.id).completedAt, null, 'a parent with children cannot be completed directly');
  store.toggleNote(firstChild.id);
  assert.equal(store.getNote(parent.id).completedAt, null, 'one completed child does not complete the parent');
  assert.ok(store.toggleNote(secondChild.id).completedAt, 'the second completed child completes the parent');
  assert.ok(store.getNote(parent.id).completedAt);
});

test('notes survive a new store instance reading the same local file', () => {
  const { directory, store } = createStore();
  const note = store.createNote('研究 Android 与 Windows 同步');

  const reopened = new NoteStore(path.join(directory, 'notes.json'));
  assert.deepEqual(reopened.getNote(note.id).content, '研究 Android 与 Windows 同步');
});
