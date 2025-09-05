export const habit = (fields = {}) => ({
  id: 'read', name: 'Read', weekdays: [0, 1, 2, 3, 4, 5, 6], color: 'green',
  createdAt: '2025-01-01', logs: [], ...fields
});
export function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
