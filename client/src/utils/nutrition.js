/** Sum nutrition across plan entries (respects servings) */
export function planTotals(plan) {
  const totals = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, count: 0, consumed: 0 };
  for (const entry of plan?.entries || []) {
    const meal = entry.meal;
    if (!meal) continue;
    const n = entry.servings || 1;
    totals.calories += meal.calories * n;
    totals.protein += meal.protein * n;
    totals.carbs += meal.carbs * n;
    totals.fats += meal.fats * n;
    totals.fiber += meal.fiber * n;
    totals.count += 1;
    if (entry.consumed) totals.consumed += meal.calories * n;
  }
  return totals;
}

export const todayStr = () => new Date().toISOString().slice(0, 10);

export function dateOffsetStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function prettyDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function fmt(n) {
  return Math.round(n || 0).toLocaleString();
}

export const SLOT_META = {
  Breakfast: { emoji: '🌅', color: 'bg-amber-100 text-amber-700' },
  Lunch: { emoji: '☀️', color: 'bg-sky-100 text-sky-700' },
  Dinner: { emoji: '🌙', color: 'bg-violet-100 text-violet-700' },
  Snack: { emoji: '🍪', color: 'bg-rose-100 text-rose-700' },
};

export const SLOT_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
