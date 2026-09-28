import MealPlan from '../models/MealPlan.js';
import Meal from '../models/Meal.js';

const today = () => new Date().toISOString().slice(0, 10);

function normalizeDate(date) {
  const d = date || today();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const err = new Error('date must be in YYYY-MM-DD format');
    err.statusCode = 400;
    throw err;
  }
  return d;
}

/** Fetch the user's plan for a date, creating an empty one if needed */
async function getOrCreatePlan(userId, date) {
  let plan = await MealPlan.findOne({ user: userId, date });
  if (!plan) plan = await MealPlan.create({ user: userId, date, entries: [] });
  return plan;
}

// @route  GET /api/plans?date=YYYY-MM-DD
export async function getPlan(req, res) {
  const date = normalizeDate(req.query.date);
  const plan = await getOrCreatePlan(req.user._id, date);
  await plan.populate('entries.meal');
  res.json({ plan });
}

// @route  POST /api/plans/entries  { date, mealId, slot, servings }
export async function addEntry(req, res) {
  const date = normalizeDate(req.body.date);
  const { mealId, slot, servings } = req.body;

  const meal = await Meal.findById(mealId);
  if (!meal) return res.status(404).json({ message: 'Meal not found' });

  const validSlots = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const finalSlot = validSlots.includes(slot) ? slot : meal.category;

  const plan = await getOrCreatePlan(req.user._id, date);
  plan.entries.push({ meal: meal._id, slot: finalSlot, servings: servings || 1 });
  await plan.save();
  await plan.populate('entries.meal');

  res.status(201).json({ plan });
}

// @route  DELETE /api/plans/entries/:entryId?date=YYYY-MM-DD
export async function removeEntry(req, res) {
  const date = normalizeDate(req.query.date);
  const plan = await MealPlan.findOne({ user: req.user._id, date });
  if (!plan) return res.status(404).json({ message: 'Plan not found for this date' });

  const entry = plan.entries.id(req.params.entryId);
  if (!entry) return res.status(404).json({ message: 'Entry not found' });

  entry.deleteOne();
  await plan.save();
  await plan.populate('entries.meal');
  res.json({ plan });
}

// @route  PATCH /api/plans/entries/:entryId/toggle  { date }
export async function toggleConsumed(req, res) {
  const date = normalizeDate(req.body.date ?? req.query.date);
  const plan = await MealPlan.findOne({ user: req.user._id, date });
  if (!plan) return res.status(404).json({ message: 'Plan not found for this date' });

  const entry = plan.entries.id(req.params.entryId);
  if (!entry) return res.status(404).json({ message: 'Entry not found' });

  entry.consumed = !entry.consumed;
  await plan.save();
  await plan.populate('entries.meal');
  res.json({ plan });
}

// @route  GET /api/plans/summary?days=7
export async function summary(req, res) {
  const days = Math.min(Number(req.query.days) || 7, 31);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const plans = await MealPlan.find({
    user: req.user._id,
    date: { $gte: start.toISOString().slice(0, 10) },
  })
    .populate('entries.meal')
    .lean();

  const byDate = {};
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    byDate[key] = { date: key, calories: 0, protein: 0, carbs: 0, fats: 0, meals: 0, consumedCalories: 0 };
  }

  for (const plan of plans) {
    const bucket = byDate[plan.date];
    if (!bucket) continue;
    for (const entry of plan.entries) {
      if (!entry.meal) continue;
      const n = entry.servings || 1;
      bucket.calories += entry.meal.calories * n;
      bucket.protein += entry.meal.protein * n;
      bucket.carbs += entry.meal.carbs * n;
      bucket.fats += entry.meal.fats * n;
      bucket.meals += 1;
      if (entry.consumed) bucket.consumedCalories += entry.meal.calories * n;
    }
  }

  res.json({ summary: Object.values(byDate) });
}
