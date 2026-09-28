import User from '../models/User.js';

// @route  GET /api/users/profile
export async function getProfile(req, res) {
  res.json({ user: req.user });
}

// @route  PUT /api/users/profile
export async function updateProfile(req, res) {
  const allowed = [
    'name',
    'dietPreference',
    'age',
    'gender',
    'heightCm',
    'weightKg',
    'activityLevel',
    'goal',
    'dailyCalorieGoal',
    'dailyProteinGoal',
  ];

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });

  await req.user.save();
  res.json({ user: req.user });
}

// (Optional helper) Suggest calorie/protein targets using Mifflin-St Jeor
// @route  POST /api/users/suggest-goals
export async function suggestGoals(req, res) {
  const { age, gender, heightCm, weightKg, activityLevel, goal } = req.body;

  if (!age || !heightCm || !weightKg || !gender) {
    return res.status(400).json({ message: 'age, gender, heightCm and weightKg are required' });
  }

  const s = gender === 'male' ? 5 : gender === 'female' ? -161 : -78;
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + s;

  const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, 'very-active': 1.9 };
  let calories = Math.round(bmr * (factors[activityLevel] || 1.2));

  if (goal === 'lose') calories -= 400;
  if (goal === 'gain') calories += 300;

  const protein = Math.round(weightKg * (goal === 'gain' ? 1.8 : goal === 'lose' ? 1.6 : 1.2));

  res.json({ dailyCalorieGoal: Math.max(calories, 1200), dailyProteinGoal: protein });
}
