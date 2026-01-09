export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('日期格式应为 YYYY-MM-DD');
  }
  const parsed = new Date(value + 'T00:00:00Z');
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error('日期不存在');
  }
  return value;
}

export function addDays(value, offset) {
  validDate(value);
  if (!Number.isInteger(offset) || Math.abs(offset) > 36600) throw new Error('日期偏移超出范围');
  const date = new Date(value + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + offset);
  const output = date.toISOString().slice(0, 10);
  validDate(output);
  return output;
}

export function todayKey(now = new Date()) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new Error('无效时间');
  const year = String(now.getFullYear()).padStart(4, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const value = [year, month, day].join('-');
  validDate(value);
  return value;
}

export function normalizeWeekdays(days) {
  if (!Array.isArray(days) || !days.length || days.length > 7) {
    throw new Error('请至少选择一个打卡日');
  }
  if (days.some(day => !Number.isInteger(day) || day < 0 || day > 6)) {
    throw new Error('星期必须是 0 到 6 的整数');
  }
  if (new Set(days).size !== days.length) throw new Error('打卡日不能重复');
  return [...days].sort((a, b) => a - b);
}

export function normalizeHabit(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('习惯数据无效');
  if (typeof raw.id !== 'string' || !raw.id.trim() || raw.id.length > 100) throw new Error('习惯 ID 无效');
  if (typeof raw.name !== 'string' || !raw.name.trim() || raw.name.trim().length > 80) throw new Error('名称需要 1 到 80 个字符');
  const weekdays = normalizeWeekdays(raw.weekdays);
  const createdAt = validDate(raw.createdAt);
  if (!Array.isArray(raw.logs) || raw.logs.length > 20000) throw new Error('打卡记录无效或过多');
  if (new Set(raw.logs).size !== raw.logs.length) throw new Error('打卡记录不能重复');
  const logs = raw.logs.map(validDate).sort();
  for (const date of logs) {
    if (date < createdAt || !weekdays.includes(new Date(date + 'T00:00:00Z').getUTCDay())) throw new Error('打卡日期不符合计划');
  }
  const color = ['green', 'blue', 'amber', 'rose'].includes(raw.color) ? raw.color : 'green';
  return { id: raw.id, name: raw.name.trim(), weekdays, color, createdAt, logs };
}

export function createHabit(name, weekdays, id, date, color = 'green') {
  const draft = {
    id,
    name,
    weekdays,
    color,
    createdAt: date,
    logs: []
  };
  return normalizeHabit(draft);
}

export function renameHabit(habits, id, name) {
  if (!habits.some(habit => habit.id === id)) throw new Error('未找到习惯');
  const updated = habits.map(habit => {
    if (habit.id !== id) return habit;
    const draft = { ...habit, name };
    return normalizeHabit(draft);
  });
  return updated;
}

export function removeHabit(habits, id) {
  if (!Array.isArray(habits)) throw new Error('习惯列表无效');
  const target = habits.find(habit => habit.id === id);
  if (!target) throw new Error('未找到习惯');
  const remaining = habits.filter(habit => habit.id !== id);
  if (remaining.length !== habits.length - 1) throw new Error('习惯 ID 重复');
  return remaining;
}

export function isScheduled(habit, date) {
  validDate(date);
  if (date < habit.createdAt) return false;
  const parsed = new Date(date + 'T00:00:00Z');
  const weekday = parsed.getUTCDay();
  const selected = habit.weekdays.includes(weekday);
  return selected;
}

export function toggleLog(habits, id, date, today) {
  validDate(date); validDate(today);
  if (date > today) throw new Error('不能为未来日期打卡');
  if (!habits.some(habit => habit.id === id)) throw new Error('未找到习惯');
  return habits.map(habit => {
    if (habit.id !== id) return habit;
    if (!isScheduled(habit, date)) throw new Error('这一天不在习惯计划内');
    const logs = habit.logs.includes(date) ? habit.logs.filter(day => day !== date) : [...habit.logs, date];
    return normalizeHabit({ ...habit, logs });
  });
}

export function logsBetween(habit, start, end) {
  validDate(start); validDate(end);
  if (start > end) throw new Error('开始日期不能晚于结束日期');
  const matches = habit.logs.filter(date => {
    if (date < start || date > end) return false;
    return isScheduled(habit, date);
  });
  return [...matches].sort();
}

export function scheduledDates(habit, start, end) {
  validDate(start); validDate(end);
  const days = (Date.parse(end) - Date.parse(start)) / 86400000;
  if (days < 0 || days > 3660) throw new Error('日期范围应为 0 到 3660 天');
  const scheduled = [];
  for (let offset = 0; offset <= days; offset++) {
    const date = addDays(start, offset);
    if (isScheduled(habit, date)) scheduled.push(date);
  }
  return scheduled;
}

export function completionRate(habit, start, end) {
  const dates = scheduledDates(habit, start, end);
  const done = new Set(logsBetween(habit, start, end));
  const completed = dates.filter(date => done.has(date)).length;
  return {
    scheduled: dates.length,
    completed,
    percent: dates.length ? Math.round(completed / dates.length * 100) : 0
  };
}

export function currentStreak(habit, today) {
  validDate(today);
  const logs = new Set(habit.logs);
  let date = today;
  let streak = 0;
  for (let checked = 0; checked < 140007 && date >= habit.createdAt; checked++) {
    if (isScheduled(habit, date) && (date !== today || logs.has(date))) {
      if (!logs.has(date)) break;
      streak++;
    }
    if (date === habit.createdAt) break;
    date = addDays(date, -1);
  }
  return streak;
}

export function bestStreak(habit, today) {
  validDate(today);
  const dates = habit.logs.filter(date => date <= today && isScheduled(habit, date)).sort();
  let best = 0; let current = 0; let previous = null;
  for (const date of dates) {
    let next = previous ? addDays(previous, 1) : null;
    while (next && !isScheduled(habit, next)) next = addDays(next, 1);
    current = next === date ? current + 1 : 1;
    best = Math.max(best, current);
    previous = date;
  }
  return best;
}

export function weekSummary(habits, anchor) {
  validDate(anchor);
  const weekday = new Date(anchor + 'T00:00:00Z').getUTCDay();
  const monday = addDays(anchor, -((weekday + 6) % 7));
  return Array.from({ length: 7 }, (_, offset) => {
    const date = addDays(monday, offset);
    const scheduled = habits.filter(habit => isScheduled(habit, date));
    return { date, scheduled: scheduled.length, completed: scheduled.filter(habit => habit.logs.includes(date)).length };
  });
}

export function monthGrid(month) {
  if (typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) throw new Error('月份格式应为 YYYY-MM');
  const first = validDate(month + '-01');
  const weekday = new Date(first + 'T00:00:00Z').getUTCDay();
  const start = addDays(first, -((weekday + 6) % 7));
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    return { date, inMonth: date.startsWith(month + '-') };
  });
}

const MAX_BACKUP_BYTES = 5_000_000;
function checkBackupSize(text) {
  if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) throw new Error('备份文件不能超过 5 MB');
}

export function exportHabits(habits) {
  if (!Array.isArray(habits) || habits.length > 100) throw new Error('最多支持 100 个习惯');
  const records = habits.map(normalizeHabit);
  const ids = records.map(habit => habit.id);
  if (new Set(ids).size !== ids.length) throw new Error('习惯 ID 重复');
  const payload = { app: 'little-habits', version: 1, habits: records };
  const serialized = JSON.stringify(payload, null, 2);
  checkBackupSize(serialized);
  return serialized;
}

export function importHabits(text, today = todayKey()) {
  validDate(today);
  if (typeof text !== 'string') throw new Error('备份必须是 JSON 文本');
  checkBackupSize(text);
  const data = JSON.parse(text);
  if (!data || data.app !== 'little-habits' || data.version !== 1 || !Array.isArray(data.habits)) throw new Error('不是有效的习惯备份');
  const records = JSON.parse(exportHabits(data.habits)).habits;
  for (const habit of records) {
    if (habit.createdAt > today || habit.logs.some(date => date > today)) throw new Error('备份包含未来记录');
  }
  return records;
}

export function sampleHabits(today) {
  validDate(today);
  const start = addDays(today, -20);
  const definitions = [['sample-read', '阅读 20 分钟', 'green'], ['sample-walk', '出去走走', 'blue'], ['sample-water', '认真喝水', 'amber']];
  return definitions.map(([id, name, color], index) => {
    const habit = createHabit(name, index === 1 ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6], id, start, color);
    const dates = scheduledDates(habit, start, today);
    habit.logs = dates.filter((date, offset) => date < today && (offset + index) % 5 !== 0);
    return habit;
  });
}

