import Meal from '../models/Meal.js';

// @route  GET /api/meals?search=&category=&dietType=&sort=
export async function getMeals(req, res) {
  const { search, category, dietType, sort } = req.query;
  const filter = {};

  if (search) {
    const rx = new RegExp(search.trim().split(/\s+/).join('|'), 'i');
    filter.$or = [{ name: rx }, { description: rx }];
  }
  if (category && category !== 'All') filter.category = category;
  if (dietType && dietType !== 'All') filter.dietType = dietType;

  let query = Meal.find(filter);
  if (sort === 'calories-asc') query = query.sort('calories');
  else if (sort === 'calories-desc') query = query.sort('-calories');
  else if (sort === 'protein-desc') query = query.sort('-protein');
  else query = query.sort('name');

  const meals = await query.lean();
  res.json({ meals });
}

// @route  GET /api/meals/:id
export async function getMeal(req, res) {
  const meal = await Meal.findById(req.params.id).lean();
  if (!meal) return res.status(404).json({ message: 'Meal not found' });
  res.json({ meal });
}

// @route  POST /api/meals  (users can add custom meals)
export async function createMeal(req, res) {
  const { name, description, category, dietType, emoji, calories, protein, carbs, fats, fiber, servingLabel } =
    req.body;

  if (!name || !category || !dietType || calories == null) {
    return res.status(400).json({ message: 'name, category, dietType and calories are required' });
  }

  const exists = await Meal.findOne({ name: name.trim() });
  if (exists) return res.status(409).json({ message: 'A meal with this name already exists' });

  const meal = await Meal.create({
    name,
    description,
    category,
    dietType,
    emoji,
    calories,
    protein: protein || 0,
    carbs: carbs || 0,
    fats: fats || 0,
    fiber: fiber || 0,
    servingLabel,
    createdBy: req.user._id,
  });

  res.status(201).json({ meal });
}

// @route  DELETE /api/meals/:id  (owner or admin)
export async function deleteMeal(req, res) {
  const meal = await Meal.findById(req.params.id);
  if (!meal) return res.status(404).json({ message: 'Meal not found' });

  const isOwner = meal.createdBy && String(meal.createdBy) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You can only delete meals you created' });
  }

  await meal.deleteOne();
  res.json({ message: 'Meal deleted' });
}
