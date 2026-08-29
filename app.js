import * as core from './core.js';
const byId = id => document.getElementById(id);
const storageKey = 'little-habits-v1';
const weekdayNames = ['日', '一', '二', '三', '四', '五', '六'];
let habits = [];
let storageBlocked = false;
let initialMessage = '添加一个习惯，或载入示例体验。';
try {
  const saved = localStorage.getItem(storageKey);
  if (saved !== null) habits = core.importHabits(saved);
} catch {
  storageBlocked = true;
  initialMessage = '本地记录无法读取，原数据尚未覆盖。可导入备份，或清除损坏数据。';
}
byId('recover').hidden = !storageBlocked;
byId('active-date').value = core.todayKey();
byId('active-date').max = core.todayKey();
byId('month').value = core.todayKey().slice(0, 7);
for (const day of [1, 2, 3, 4, 5, 6, 0]) {
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox'; checkbox.value = String(day); checkbox.checked = true;
  label.append(checkbox, document.createTextNode('周' + weekdayNames[day]));
  byId('weekdays').append(label);
}
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = String(text);
  if (className) node.className = className;
  return node;
}
function announce(message) { byId('status').textContent = message; }
function action(callback) {
  try { callback(); } catch (error) { announce(error.message); }
}
function commit(next, message) {
  if (storageBlocked) throw new Error('请先恢复或清除损坏数据。');
  const text = core.exportHabits(next);
  try { localStorage.setItem(storageKey, text); }
  catch { throw new Error('保存失败：浏览器存储不可用或空间不足。请导出已有记录。'); }
  habits = next;
  render();
  announce(message);
}

function renderHabits() {
  const date = byId('active-date').value;
  const mode = byId('filter').value;
  const visible = habits.filter(habit => mode === 'all' || (core.isScheduled(habit, date) && (mode !== 'pending' || !habit.logs.includes(date))));
  byId('habit-list').replaceChildren();
  for (const habit of visible) {
    const scheduled = core.isScheduled(habit, date);
    const done = habit.logs.includes(date);
    const card = element('article', undefined, 'habit habit-' + habit.color);
    const title = element('div', undefined, 'row section-title');
    title.append(element('h3', habit.name), element('span', scheduled ? done ? '已完成' : '待完成' : '休息日', 'badge'));
    card.append(title, element('p', habit.weekdays.map(day => '周' + weekdayNames[day]).join(' · '), 'muted'));
    const rate = core.completionRate(habit, core.addDays(date, -6), date);
    card.append(element('p', '当前连续 ' + core.currentStreak(habit, date) + ' 次 · 最佳连续 ' + core.bestStreak(habit, date) + ' 次 · 近 7 天 ' + rate.percent + '%', 'habit-stats'));
    const toolbar = element('div', undefined, 'toolbar');
    const toggle = element('button', done ? '撤销打卡' : '完成打卡', done ? 'secondary' : '');
    toggle.type = 'button'; toggle.disabled = !scheduled || storageBlocked;
    toggle.addEventListener('click', () => action(() => commit(core.toggleLog(habits, habit.id, date, core.todayKey()), done ? '已撤销打卡。' : '已记录这一次完成。')));
    const rename = element('button', '重命名', 'secondary'); rename.type = 'button';
    rename.addEventListener('click', () => { const name = prompt('新的习惯名称', habit.name); if (name !== null) action(() => commit(core.renameHabit(habits, habit.id, name), '名称已更新。')); });
    const remove = element('button', '删除', 'danger'); remove.type = 'button';
    remove.addEventListener('click', () => { if (confirm('删除“' + habit.name + '”及其全部打卡记录？')) action(() => commit(core.removeHabit(habits, habit.id), '习惯已删除。')); });
    toolbar.append(toggle, rename, remove); card.append(toolbar); byId('habit-list').append(card);
  }
  if (!visible.length) byId('habit-list').append(element('p', habits.length ? '这个筛选条件下没有习惯。' : '从一件小事开始，添加你的第一个习惯。', 'empty'));
}
