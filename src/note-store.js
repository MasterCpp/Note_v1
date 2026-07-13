const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

class NoteStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = this.read();
  }

  read() {
    try {
      const parsed = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      return { notes: Array.isArray(parsed.notes) ? parsed.notes : [], settings: parsed.settings || { alwaysOnTop: false } };
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      return { notes: [], settings: { alwaysOnTop: false } };
    }
  }

  save() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  timestamp() { return new Date().toISOString(); }

  createNote(content) {
    const note = this.makeNote(content, null);
    this.data.notes.unshift(note);
    this.save();
    return note;
  }

  createChild(parentId, content) {
    const parent = this.requireNote(parentId);
    if (parent.parentId) throw new Error('Only one level of child notes is supported.');
    if (parent.completedAt) throw new Error('Completed notes cannot receive child notes.');
    const child = this.makeNote(content, parentId);
    this.data.notes.push(child);
    parent.updatedAt = this.timestamp();
    this.save();
    return child;
  }

  makeNote(content, parentId) {
    const normalized = String(content || '').trim();
    if (!normalized) throw new Error('A note needs one sentence of text.');
    const now = this.timestamp();
    return { id: crypto.randomUUID(), content: normalized, parentId, createdAt: now, updatedAt: now, completedAt: null };
  }

  listNotes({ completed } = {}) {
    return this.data.notes
      .filter((note) => note.parentId === null)
      .filter((note) => completed === undefined || Boolean(note.completedAt) === completed)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((note) => this.withChildren(note));
  }

  searchNotes(query, { completed } = {}) {
    const normalized = String(query || '').trim().toLocaleLowerCase();
    return this.listNotes({ completed }).filter((note) => {
      return !normalized || note.content.toLocaleLowerCase().includes(normalized) || note.children.some((child) => child.content.toLocaleLowerCase().includes(normalized));
    });
  }

  getNote(id) {
    const note = this.requireNote(id);
    return note.parentId === null ? this.withChildren(note) : { ...note };
  }

  withChildren(note) {
    const children = this.data.notes.filter((child) => child.parentId === note.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return { ...note, children: children.map((child) => ({ ...child })) };
  }

  updateNote(id, content) {
    const note = this.requireNote(id);
    const normalized = String(content || '').trim();
    if (!normalized) throw new Error('A note needs one sentence of text.');
    note.content = normalized;
    note.updatedAt = this.timestamp();
    this.save();
    return this.getNote(id);
  }

  toggleNote(id) {
    const note = this.requireNote(id);
    const children = note.parentId === null ? this.childrenOf(note.id) : [];
    if (children.length) return this.getNote(id);

    note.completedAt = note.completedAt ? null : this.timestamp();
    note.updatedAt = this.timestamp();
    if (note.parentId) this.reconcileParent(note.parentId);
    this.save();
    return this.getNote(id);
  }

  reconcileParent(parentId) {
    const parent = this.requireNote(parentId);
    const children = this.childrenOf(parentId);
    parent.completedAt = children.length && children.every((child) => child.completedAt) ? this.timestamp() : null;
    parent.updatedAt = this.timestamp();
  }

  deleteNote(id) {
    const note = this.requireNote(id);
    const parentId = note.parentId;
    const ids = new Set([id, ...this.childrenOf(id).map((child) => child.id)]);
    this.data.notes = this.data.notes.filter((candidate) => !ids.has(candidate.id));
    if (parentId) this.reconcileParent(parentId);
    this.save();
  }

  getSettings() { return { ...this.data.settings }; }

  updateSettings(patch) {
    this.data.settings = { ...this.data.settings, ...patch };
    this.save();
    return this.getSettings();
  }

  childrenOf(parentId) { return this.data.notes.filter((note) => note.parentId === parentId); }

  requireNote(id) {
    const note = this.data.notes.find((candidate) => candidate.id === id);
    if (!note) throw new Error('Note not found.');
    return note;
  }
}

module.exports = { NoteStore };
