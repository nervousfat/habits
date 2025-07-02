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

