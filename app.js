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
