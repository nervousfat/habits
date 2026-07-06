import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from './core.js';

test("calendar dates reject rollover and malformed input", () => {
  assert.equal(core.validDate('2024-02-29'), '2024-02-29');
  assert.throws(() => core.validDate('2025-02-29'));
  assert.throws(() => core.validDate('2025-04-31'));
  assert.throws(() => core.validDate('2025-1-01'));
  assert.throws(() => core.validDate('hello'));
  assert.throws(() => core.validDate(null));
  assert.equal(core.validDate('2026-09-10'), '2026-09-10');
  assert.throws(() => core.validDate('2026-13-01'));
});

test("date offsets cross month and year boundaries", () => {
  assert.equal(core.addDays('2024-02-28', 1), '2024-02-29');
  assert.equal(core.addDays('2024-02-29', 1), '2024-03-01');
  assert.equal(core.addDays('2025-01-01', -1), '2024-12-31');
  assert.equal(core.addDays('2025-03-09', 1), '2025-03-10');
  assert.equal(core.addDays('2026-09-10', 0), '2026-09-10');
  assert.throws(() => core.addDays('2026-09-10', 1.5));
  assert.throws(() => core.addDays('2026-09-10', Infinity));
  assert.throws(() => core.addDays('invalid', 1));
});

test("local date keys reflect local clock components", () => {
  const date = new Date(2026, 8, 10, 23, 59);
  assert.equal(core.todayKey(date), '2026-09-10');
  assert.equal(core.todayKey(new Date(2026, 0, 1)), '2026-01-01');
  assert.throws(() => core.todayKey(new Date(NaN)));
  assert.throws(() => core.todayKey('2026-09-10'));
  const result = core.todayKey();
  assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(core.validDate(result), result);
});

test("weekly schedules sort and validate weekday selections", () => {
  assert.deepEqual(core.normalizeWeekdays([5, 1, 3]), [1, 3, 5]);
  assert.deepEqual(core.normalizeWeekdays([0]), [0]);
  assert.throws(() => core.normalizeWeekdays([]));
  assert.throws(() => core.normalizeWeekdays([1, 1]));
  assert.throws(() => core.normalizeWeekdays([7]));
  assert.throws(() => core.normalizeWeekdays([-1]));
  assert.throws(() => core.normalizeWeekdays(['1']));
  assert.throws(() => core.normalizeWeekdays(null));
});

test("habit creation enforces names identifiers and start dates", () => {
  const habit = core.createHabit(' 阅读 ', [1], 'read', '2026-09-01');
  assert.equal(habit.name, '阅读');
  assert.equal(habit.id, 'read');
  assert.deepEqual(habit.logs, []);
  assert.equal(habit.color, 'green');
  assert.throws(() => core.createHabit(' ', [1], 'x', '2026-09-01'));
  assert.throws(() => core.createHabit('a', [1], '', '2026-09-01'));
  assert.throws(() => core.createHabit('a'.repeat(81), [1], 'x', '2026-09-01'));
});

test("renaming and removal preserve previous state", () => {
  const original = [core.createHabit('阅读', [1], 'x', '2026-09-01')];
  const renamed = core.renameHabit(original, 'x', '写作');
  assert.equal(renamed[0].name, '写作');
  assert.equal(original[0].name, '阅读');
  assert.deepEqual(core.removeHabit(original, 'x'), []);
  assert.equal(original.length, 1);
  assert.throws(() => core.renameHabit(original, 'missing', 'hello'));
  assert.throws(() => core.removeHabit(original, 'missing'));
});

test("schedules exclude dates before creation and rest days", () => {
  const habit = core.createHabit('运动', [1, 3, 5], 'x', '2026-09-01');
  assert.equal(core.isScheduled(habit, '2026-08-31'), false);
  assert.equal(core.isScheduled(habit, '2026-09-02'), true);
  assert.equal(core.isScheduled(habit, '2026-09-03'), false);
  assert.equal(core.isScheduled(habit, '2026-09-04'), true);
  assert.equal(core.isScheduled(habit, '2026-09-05'), false);
  assert.equal(core.isScheduled(habit, '2026-09-07'), true);
  assert.throws(() => core.isScheduled(habit, '2026-09-31'));
});

test("completion toggling is reversible and blocks future dates", () => {
  const source = [core.createHabit('运动', [1, 3, 5], 'x', '2026-09-01')];
  const done = core.toggleLog(source, 'x', '2026-09-02', '2026-09-10');
  assert.deepEqual(done[0].logs, ['2026-09-02']);
  assert.deepEqual(source[0].logs, []);
  assert.deepEqual(core.toggleLog(done, 'x', '2026-09-02', '2026-09-10')[0].logs, []);
  assert.throws(() => core.toggleLog(source, 'x', '2026-09-11', '2026-09-10'));
  assert.throws(() => core.toggleLog(source, 'x', '2026-09-03', '2026-09-10'));
  assert.throws(() => core.toggleLog(source, 'unknown', '2026-09-02', '2026-09-10'));
});

test("scheduled completion rates use inclusive date ranges", () => {
  const habit = core.createHabit('运动', [1, 3, 5], 'x', '2026-09-01');
  habit.logs = ['2026-09-02', '2026-09-07'];
  assert.deepEqual(core.scheduledDates(habit, '2026-09-01', '2026-09-07'), ['2026-09-02', '2026-09-04', '2026-09-07']);
  assert.deepEqual(core.logsBetween(habit, '2026-09-02', '2026-09-04'), ['2026-09-02']);
  assert.deepEqual(core.completionRate(habit, '2026-09-01', '2026-09-07'), { scheduled: 3, completed: 2, percent: 67 });
  assert.equal(core.completionRate(habit, '2026-09-05', '2026-09-06').percent, 0);
  assert.throws(() => core.scheduledDates(habit, '2026-09-07', '2026-09-01'));
  assert.throws(() => core.scheduledDates(habit, '2000-01-01', '2026-09-01'));
});

test("active streaks skip rest days and keep today open", () => {
  const habit = core.createHabit('运动', [1, 3, 5], 'x', '2026-09-01');
  habit.logs = ['2026-09-02', '2026-09-04', '2026-09-07'];
  assert.equal(core.currentStreak(habit, '2026-09-07'), 3);
  assert.equal(core.currentStreak(habit, '2026-09-08'), 3);
  assert.equal(core.currentStreak(habit, '2026-09-09'), 3);
  assert.equal(core.currentStreak(habit, '2026-09-10'), 0);
  assert.equal(core.currentStreak(habit, '2026-08-31'), 0);
  assert.equal(core.currentStreak({ ...habit, logs: [] }, '2026-09-02'), 0);
});

test("best streaks detect gaps in weekly schedules", () => {
  const habit = core.createHabit('运动', [1, 3, 5], 'x', '2026-09-01');
  habit.logs = ['2026-09-02', '2026-09-04', '2026-09-07', '2026-09-11'];
  assert.equal(core.bestStreak(habit, '2026-09-11'), 3);
  assert.equal(core.bestStreak(habit, '2026-09-02'), 1);
  assert.equal(core.bestStreak(habit, '2026-08-31'), 0);
  assert.equal(core.bestStreak({ ...habit, logs: [] }, '2026-09-11'), 0);
  habit.logs = ['2026-09-04', '2026-09-07'];
  assert.equal(core.bestStreak(habit, '2026-09-10'), 2);
});

test("weekly and monthly grids start on Monday", () => {
  const habit = core.createHabit('阅读', [0, 1, 2, 3, 4, 5, 6], 'x', '2026-09-01');
  habit.logs = ['2026-09-07'];
  const week = core.weekSummary([habit], '2026-09-10');
  assert.equal(week[0].date, '2026-09-07');
  assert.equal(week[0].completed, 1);
  assert.equal(week.length, 7);
  assert.equal(core.monthGrid('2026-09').length, 42);
  assert.equal(core.monthGrid('2026-09')[0].date, '2026-08-31');
  assert.equal(core.monthGrid('2026-09').filter(day => day.inMonth).length, 30);
});

test("backup import rejects duplicates future logs and malformed data", () => {
  const habit = core.createHabit('阅读', [0, 1, 2, 3, 4, 5, 6], 'x', '2026-09-01');
  assert.deepEqual(core.importHabits(core.exportHabits([habit]), '2026-09-10'), [habit]);
  assert.throws(() => core.exportHabits([habit, habit]));
  assert.throws(() => core.importHabits('{bad', '2026-09-10'));
  assert.throws(() => core.importHabits('{}', '2026-09-10'));
  assert.throws(() => core.importHabits(core.exportHabits([{ ...habit, logs: ['2026-09-11'] }]), '2026-09-10'));
  assert.throws(() => core.normalizeHabit({ ...habit, logs: ['2026-09-02', '2026-09-02'] }));
  assert.throws(() => core.normalizeHabit({ ...habit, logs: ['2026-08-31'] }));
});

test("sample records remain valid across month boundaries", () => {
  const habits = core.sampleHabits('2026-01-01');
  assert.equal(habits.length, 3);
  assert.equal(new Set(habits.map(habit => habit.id)).size, 3);
  for (const habit of habits) {
    assert.deepEqual(core.normalizeHabit(habit), habit);
    assert.ok(habit.logs.every(date => date < '2026-01-01'));
    assert.ok(habit.logs.length > 0);
  }
  assert.deepEqual(core.importHabits(core.exportHabits(habits), '2026-01-01'), habits);
});

