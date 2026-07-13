const app = document.getElementById('app');
const state = { screen: 'widget', listStatus: false, searchOpen: false, query: '', editingId: null, addingChildTo: null, notice: '' };

const icons = {
  minus: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
  close: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  pin: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17v5M8 3h8l-1 6 3 3H6l3-3-1-6Z"/></svg>',
  tick: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
  search: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>',
  back: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m19 12H5m6 6-6-6 6-6"/></svg>',
  trash: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M9 7l1-2h4l1 2m-9 0 1 13h10l1-13"/></svg>'
};

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
const formatDate = (value) => new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));

function windowBar(settings) {
  return `<header class="window-bar drag-region"><span></span><span class="window-actions no-drag"><button class="window-button" data-action="minimize" aria-label="最小化">${icons.minus}</button><button class="window-button close" data-action="hide" aria-label="关闭并隐藏">${icons.close}</button></span></header>`;
}

function checkbox(note, child = false) {
  const disabled = !child && note.children?.length > 0;
  return `<button class="check${note.completedAt ? ' done' : ''}${disabled ? ' disabled' : ''}" data-action="toggle" data-id="${note.id}" ${disabled ? 'disabled title="请先完成全部子 Note"' : ''} aria-label="标记${note.completedAt ? '未完成' : '完成'}">${note.completedAt ? icons.tick : ''}</button>`;
}

function entry(note, index, detailed = false) {
  const childRows = note.children?.map((child) => `<div class="subentry${child.completedAt ? ' done' : ''}">${checkbox(child, true)}<button class="entry-title${child.completedAt ? ' done' : ''}" data-action="edit" data-id="${child.id}">${escapeHtml(child.content)}</button></div>`).join('') || '';
  const editing = state.editingId === note.id;
  const title = editing ? `<input class="edit-input" data-edit-id="${note.id}" value="${escapeHtml(note.content)}">` : `<button class="entry-title${note.completedAt ? ' done' : ''}" data-action="edit" data-id="${note.id}">${escapeHtml(note.content)}</button>`;
  const addChild = state.addingChildTo === note.id ? `<form class="child-form" data-child-form="${note.id}"><input aria-label="子 Note" placeholder="下一步是什么？" autofocus><button>添加</button></form>` : '';
  const actionRow = !note.completedAt ? `<div class="entry-actions"><button class="text-action" data-action="add-child" data-id="${note.id}">+ 子 Note</button></div>${addChild}` : '';
  const progress = note.children?.length ? `${note.children.filter((child) => child.completedAt).length} / ${note.children.length}` : '';
  return `<article class="entry"><span class="entry-number">${String(index + 1).padStart(2, '0')}</span><div class="entry-main"><div class="entry-top">${checkbox(note)}${title}</div>${childRows ? `<div class="sublist">${childRows}</div>` : ''}${actionRow}${detailed ? `<time class="timestamp">创建于 ${formatDate(note.createdAt)}</time>` : ''}</div><span class="entry-side"><span class="entry-progress">${progress}</span><button class="delete-icon" data-action="delete" data-id="${note.id}" aria-label="删除 Note" title="删除 Note">${icons.trash}</button></span></article>`;
}

async function render() {
  const [settings, notes] = await Promise.all([
    window.ideaAPI.getSettings(),
    state.screen === 'widget' ? window.ideaAPI.listNotes({ completed: false }) : (state.query ? window.ideaAPI.searchNotes(state.query, { completed: state.listStatus }) : window.ideaAPI.listNotes({ completed: state.listStatus }))
  ]);
  if (state.screen === 'widget') {
    app.className = 'app';
    app.innerHTML = `${windowBar(settings)}<section class="masthead"><span class="title">每日索引</span><span class="heading-meta"><span class="edition">今天 · 先记下</span><button class="pin-button" data-action="top" aria-label="${settings.alwaysOnTop ? '取消置顶' : '始终置顶'}" title="${settings.alwaysOnTop ? '取消置顶' : '始终置顶'}">${icons.pin}</button></span></section><form class="composer" id="composer"><span class="plus">+</span><input id="note-input" aria-label="记录新的灵感" placeholder="写下一条，不必想清楚" autocomplete="off"><button class="save">收录</button></form><div class="notice">${escapeHtml(state.notice)}</div><div class="list-heading"><span>NO.</span><span>尚未完成的念头</span><span>进度</span></div><section class="entries">${notes.length ? notes.map((note, index) => entry(note, index)).join('') : '<div class="empty">这里还没有待办。<br>先把脑海里的那一句写下来。</div>'}</section><footer class="footer"><button class="footer-button" data-action="all">全部记录 →</button></footer>`;
  } else {
    app.className = 'app all-screen';
    app.innerHTML = `${windowBar(settings)}<section class="all-head"><button class="back" data-action="back">${icons.back} 返回挂件</button><button class="search-toggle" data-action="search" aria-label="${state.searchOpen ? '关闭搜索' : '搜索记录'}">${icons.search}</button></section>${state.searchOpen ? `<input class="search-input" id="search-input" value="${escapeHtml(state.query)}" placeholder="搜索 Note 与子 Note" autofocus>` : ''}<nav class="tabs"><button class="tab${state.listStatus === false ? ' active' : ''}" data-action="tab-open">未完成</button><button class="tab${state.listStatus === true ? ' active' : ''}" data-action="tab-completed">已完成</button></nav><div class="notice">${escapeHtml(state.notice)}</div><section class="entries">${notes.length ? notes.map((note, index) => entry(note, index, true)).join('') : '<div class="empty">没有符合条件的记录。</div>'}</section></div>`;
  }
  bindEvents();
}

function bindEvents() {
  document.getElementById('composer')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = document.getElementById('note-input');
    await run(() => window.ideaAPI.createNote(input.value));
    state.notice = '';
    await render();
    document.getElementById('note-input')?.focus();
  });
  document.querySelectorAll('[data-action]').forEach((element) => element.addEventListener('click', handleAction));
  document.querySelectorAll('[data-child-form]').forEach((form) => form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = form.querySelector('input');
    await run(() => window.ideaAPI.createChild(form.dataset.childForm, input.value));
    state.addingChildTo = null;
    await render();
  }));
  document.querySelectorAll('[data-edit-id]').forEach((input) => input.addEventListener('keydown', async (event) => {
    if (event.key === 'Escape') { state.editingId = null; await render(); }
    if (event.key === 'Enter') { await run(() => window.ideaAPI.updateNote(input.dataset.editId, input.value)); state.editingId = null; await render(); }
  }));
  document.getElementById('search-input')?.addEventListener('input', async (event) => { state.query = event.target.value; await render(); });
}

async function handleAction(event) {
  const { action, id } = event.currentTarget.dataset;
  if (action === 'minimize') return window.ideaAPI.minimize();
  if (action === 'hide') return window.ideaAPI.hide();
  if (action === 'top') { await window.ideaAPI.setAlwaysOnTop(!(await window.ideaAPI.getSettings()).alwaysOnTop); return render(); }
  if (action === 'toggle') { await run(() => window.ideaAPI.toggleNote(id)); return render(); }
  if (action === 'edit') { state.editingId = id; return render(); }
  if (action === 'add-child') { state.addingChildTo = id; return render(); }
  if (action === 'delete') { if (window.confirm('确定删除这条 Note 及其子 Note 吗？')) { await run(() => window.ideaAPI.deleteNote(id)); return render(); } return; }
  if (action === 'all') { state.screen = 'all'; return render(); }
  if (action === 'back') { state.screen = 'widget'; state.query = ''; state.searchOpen = false; return render(); }
  if (action === 'search') { state.searchOpen = !state.searchOpen; if (!state.searchOpen) state.query = ''; return render(); }
  if (action === 'tab-open') { state.listStatus = false; return render(); }
  if (action === 'tab-completed') { state.listStatus = true; return render(); }
}

async function run(operation) { try { await operation(); state.notice = ''; } catch (error) { state.notice = error.message || '操作没有完成，请重试。'; } }

window.ideaAPI.onFocusComposer(() => { state.screen = 'widget'; render().then(() => document.getElementById('note-input')?.focus()); });
render();
