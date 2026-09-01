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

byId('habit-form').addEventListener('submit', event => {
  event.preventDefault();
  action(() => {
    if (habits.length >= 100) throw new Error('最多支持 100 个习惯。');
    const weekdays = [...byId('weekdays').querySelectorAll('input:checked')].map(input => Number(input.value));
    const habit = core.createHabit(byId('habit-name').value, weekdays, crypto.randomUUID(), core.todayKey(), byId('color').value);
    commit([...habits, habit], '新习惯已添加，从今天开始。');
    byId('habit-name').value = '';
  });
});
byId('active-date').addEventListener('change', () => action(() => {
  const date = core.validDate(byId('active-date').value);
  if (date > core.todayKey()) { byId('active-date').value = core.todayKey(); throw new Error('不能查看未来打卡。'); }
  render();
}));
byId('today').addEventListener('click', () => {
  byId('active-date').value = core.todayKey();
  byId('month').value = core.todayKey().slice(0, 7);
  render();
});
byId('filter').addEventListener('change', renderHabits);
byId('month').addEventListener('change', () => action(renderCalendar));
byId('calendar-habit').addEventListener('change', () => action(renderCalendar));

function renderOverview() {
  const date = byId('active-date').value;
  const scheduled = habits.filter(habit => core.isScheduled(habit, date));
  const completed = scheduled.filter(habit => habit.logs.includes(date));
  byId('metrics').replaceChildren();
  for (const [label, value] of [['习惯总数', habits.length], ['当天计划', scheduled.length], ['当天完成', completed.length], ['完成比例', (scheduled.length ? Math.round(completed.length / scheduled.length * 100) : 0) + '%']]) {
    const card = element('div', undefined, 'card');
    card.append(element('div', label, 'muted'), element('div', value, 'metric'));
    byId('metrics').append(card);
  }
  byId('week').replaceChildren();
  for (const day of core.weekSummary(habits, date)) {
    const cell = element('div', undefined, 'week-day' + (day.date === date ? ' active' : ''));
    const weekday = new Date(day.date + 'T00:00:00Z').getUTCDay();
    cell.append(element('small', '周' + weekdayNames[weekday]), element('strong', day.date.slice(8)), element('span', day.date > core.todayKey() ? '—' : day.completed + '/' + day.scheduled, 'muted'));
    byId('week').append(cell);
  }
}
function renderCalendar() {
  const target = byId('calendar');
  target.replaceChildren();
  for (const day of ['一', '二', '三', '四', '五', '六', '日']) target.append(element('small', day, 'calendar-heading'));
  const habit = habits.find(item => item.id === byId('calendar-habit').value);
  if (!habit) { target.append(element('p', '添加习惯后查看月历。', 'calendar-empty muted')); return; }
  for (const { date, inMonth } of core.monthGrid(byId('month').value)) {
    const done = habit.logs.includes(date);
    const scheduled = core.isScheduled(habit, date);
    const button = element('button', Number(date.slice(8)), 'day' + (done ? ' done' : '') + (!inMonth ? ' outside' : ''));
    button.type = 'button';
    button.disabled = !inMonth || !scheduled || date > core.todayKey() || storageBlocked;
    button.setAttribute('aria-label', date + (done ? ' 已完成，点击撤销' : scheduled ? ' 未完成，点击打卡' : ' 休息日'));
    button.setAttribute('aria-pressed', String(done));
    button.addEventListener('click', () => action(() => commit(core.toggleLog(habits, habit.id, date, core.todayKey()), '已更新 ' + date + ' 的记录。')));
    target.append(button);
  }
}
function render() {
  byId('active-date').max = core.todayKey();
  if (!byId('active-date').value) byId('active-date').value = core.todayKey();
  if (!byId('month').value) byId('month').value = core.todayKey().slice(0, 7);
  const chosen = byId('calendar-habit').value;
  byId('calendar-habit').replaceChildren();
  for (const habit of habits) { const option = element('option', habit.name); option.value = habit.id; byId('calendar-habit').append(option); }
  if (habits.some(habit => habit.id === chosen)) byId('calendar-habit').value = chosen;
  renderHabits(); renderOverview(); renderCalendar();
}

byId('export').addEventListener('click', () => action(() => {
  const url = URL.createObjectURL(new Blob([core.exportHabits(habits)], { type: 'application/json' }));
  const link = element('a'); link.href = url; link.download = 'habits-' + core.todayKey() + '.json';
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce('备份文件已生成。');
}));
byId('import').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 5000000) throw new Error('备份文件不能超过 5 MB');
    const records = core.importHabits(await file.text());
    if (!confirm('使用备份中的 ' + records.length + ' 个习惯替换本地记录？')) return;
    localStorage.setItem(storageKey, core.exportHabits(records));
    storageBlocked = false; habits = records; byId('recover').hidden = true;
    render(); announce('备份已导入。');
  } catch (error) { announce('导入失败：' + error.message); }
  finally { event.target.value = ''; }
});
byId('sample').addEventListener('click', () => {
  if (habits.length && !confirm('示例将替换当前习惯，建议先导出备份。继续？')) return;
  action(() => commit(core.sampleHabits(core.todayKey()), '已载入三组示例习惯。'));
});
byId('recover').addEventListener('click', () => {
  if (!confirm('清除无法读取的原始记录？此操作无法撤销。')) return;
  action(() => {
    localStorage.removeItem(storageKey);
    storageBlocked = false; habits = []; byId('recover').hidden = true;
    render(); announce('已清除损坏数据，可以重新开始。');
  });
});
