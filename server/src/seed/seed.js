import path from 'node:path';
import { pathToFileURL } from 'node:url';
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Meal from '../models/Meal.js';
import MealPlan from '../models/MealPlan.js';
import SupportTicket from '../models/SupportTicket.js';

const meals = [
  // ---------- Breakfast ----------
  { name: 'Oats with Banana & Honey', emoji: '🥣', category: 'Breakfast', dietType: 'Vegetarian', calories: 320, protein: 11, carbs: 58, fats: 6, fiber: 7, servingLabel: '1 bowl (60g oats)' },
  { name: 'Masala Dosa', emoji: '🥞', category: 'Breakfast', dietType: 'Vegetarian', calories: 280, protein: 7, carbs: 44, fats: 8, fiber: 3, servingLabel: '1 dosa' },
  { name: 'Idli Sambar (3 pcs)', emoji: '🍥', category: 'Breakfast', dietType: 'Vegetarian', calories: 230, protein: 9, carbs: 42, fats: 3, fiber: 4, servingLabel: '3 idlis + sambar' },
  { name: 'Poha with Peanuts', emoji: '🍚', category: 'Breakfast', dietType: 'Vegetarian', calories: 270, protein: 7, carbs: 46, fats: 7, fiber: 3, servingLabel: '1 plate' },
  { name: 'Egg Bhurji + 2 Roti', emoji: '🍳', category: 'Breakfast', dietType: 'Non-Vegetarian', calories: 420, protein: 22, carbs: 38, fats: 19, fiber: 4, servingLabel: '2 eggs + 2 roti' },
  { name: 'Boiled Eggs & Toast', emoji: '🥚', category: 'Breakfast', dietType: 'Non-Vegetarian', calories: 350, protein: 19, carbs: 30, fats: 15, fiber: 3, servingLabel: '2 eggs + 2 slices' },
  { name: 'Greek Yogurt Parfait', emoji: '🥛', category: 'Breakfast', dietType: 'Vegetarian', calories: 290, protein: 18, carbs: 34, fats: 8, fiber: 4, servingLabel: '1 glass jar' },

  // ---------- Lunch ----------
  { name: 'Grilled Chicken Salad', emoji: '🥗', category: 'Lunch', dietType: 'Non-Vegetarian', calories: 380, protein: 38, carbs: 14, fats: 18, fiber: 5, servingLabel: '1 large bowl' },
  { name: 'Rajma Chawal', emoji: '🍛', category: 'Lunch', dietType: 'Vegetarian', calories: 450, protein: 16, carbs: 74, fats: 9, fiber: 12, servingLabel: '1 plate' },
  { name: 'Paneer Butter Masala + Roti', emoji: '🧀', category: 'Lunch', dietType: 'Vegetarian', calories: 560, protein: 21, carbs: 48, fats: 30, fiber: 5, servingLabel: '2 roti + curry' },
  { name: 'Dal Tadka + Jeera Rice', emoji: '🍲', category: 'Lunch', dietType: 'Vegetarian', calories: 430, protein: 15, carbs: 66, fats: 11, fiber: 9, servingLabel: '1 thali' },
  { name: 'Chicken Biryani', emoji: '🍗', category: 'Lunch', dietType: 'Non-Vegetarian', calories: 620, protein: 28, carbs: 72, fats: 24, fiber: 4, servingLabel: '1 plate' },
  { name: 'Fish Curry + Rice', emoji: '🐟', category: 'Lunch', dietType: 'Non-Vegetarian', calories: 510, protein: 32, carbs: 58, fats: 16, fiber: 2, servingLabel: '1 bowl + rice' },
  { name: 'Veg Pulao + Raita', emoji: '🍚', category: 'Lunch', dietType: 'Vegetarian', calories: 390, protein: 10, carbs: 62, fats: 11, fiber: 6, servingLabel: '1 plate' },
  { name: 'Chole Bhature', emoji: '🫓', category: 'Lunch', dietType: 'Vegetarian', calories: 680, protein: 18, carbs: 88, fats: 28, fiber: 10, servingLabel: '2 bhature + chole' },

  // ---------- Dinner ----------
  { name: 'Tandoori Chicken (2 pc)', emoji: '🍢', category: 'Dinner', dietType: 'Non-Vegetarian', calories: 420, protein: 42, carbs: 8, fats: 22, fiber: 1, servingLabel: '2 pieces' },
  { name: 'Paneer Tikka (8 pcs)', emoji: '🔥', category: 'Dinner', dietType: 'Vegetarian', calories: 340, protein: 20, carbs: 12, fats: 24, fiber: 2, servingLabel: '8 pieces' },
  { name: 'Grilled Fish & Veggies', emoji: '🐠', category: 'Dinner', dietType: 'Non-Vegetarian', calories: 390, protein: 35, carbs: 18, fats: 19, fiber: 5, servingLabel: '1 fillet + veggies' },
  { name: 'Veg Khichdi + Kadhi', emoji: '🥘', category: 'Dinner', dietType: 'Vegetarian', calories: 400, protein: 14, carbs: 60, fats: 10, fiber: 8, servingLabel: '1 bowl each' },
  { name: 'Chapati + Mixed Veg Curry', emoji: '🫱', category: 'Dinner', dietType: 'Vegetarian', calories: 380, protein: 11, carbs: 56, fats: 12, fiber: 8, servingLabel: '3 roti + curry' },
  { name: 'Egg Curry + Rice', emoji: '🥚', category: 'Dinner', dietType: 'Non-Vegetarian', calories: 480, protein: 22, carbs: 52, fats: 20, fiber: 3, servingLabel: '2 eggs + rice' },
  { name: 'Miso Tofu Stir Fry', emoji: '🥢', category: 'Dinner', dietType: 'Vegetarian', calories: 310, protein: 22, carbs: 26, fats: 14, fiber: 6, servingLabel: '1 wok bowl' },

  // ---------- Snack ----------
  { name: 'Roasted Chana (30g)', emoji: '🫘', category: 'Snack', dietType: 'Vegetarian', calories: 110, protein: 6, carbs: 17, fats: 2, fiber: 5, servingLabel: '1 handful' },
  { name: 'Fruit Bowl', emoji: '🍎', category: 'Snack', dietType: 'Vegetarian', calories: 130, protein: 2, carbs: 30, fats: 1, fiber: 5, servingLabel: '1 medium bowl' },
  { name: 'Peanut Butter Toast', emoji: '🥜', category: 'Snack', dietType: 'Vegetarian', calories: 210, protein: 8, carbs: 22, fats: 11, fiber: 3, servingLabel: '2 slices' },
  { name: 'Sprouts Chaat', emoji: '🌱', category: 'Snack', dietType: 'Vegetarian', calories: 160, protein: 9, carbs: 24, fats: 3, fiber: 7, servingLabel: '1 cup' },
  { name: 'Chicken Sandwich', emoji: '🥪', category: 'Snack', dietType: 'Non-Vegetarian', calories: 280, protein: 18, carbs: 30, fats: 9, fiber: 3, servingLabel: '1 sandwich' },
  { name: 'Protein Smoothie', emoji: '🥤', category: 'Snack', dietType: 'Vegetarian', calories: 240, protein: 24, carbs: 26, fats: 4, fiber: 3, servingLabel: '1 glass' },
];

export async function seed({ exit = true } = {}) {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/planmyplate';
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(uri);
  }
  console.log('✅ Connected. Seeding...');

  await Promise.all([User.deleteMany({}), Meal.deleteMany({}), MealPlan.deleteMany({}), SupportTicket.deleteMany({})]);

  const createdMeals = await Meal.insertMany(meals);
  console.log(`   🍽️  ${createdMeals.length} meals inserted`);

  await User.create([
    {
      name: 'Admin',
      email: 'admin@planmyplate.com',
      password: 'admin123',
      role: 'admin',
      dietPreference: 'both',
    },
    {
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      password: 'user123',
      dietPreference: 'vegetarian',
      age: 26,
      gender: 'male',
      heightCm: 175,
      weightKg: 70,
      activityLevel: 'moderate',
      goal: 'maintain',
      dailyCalorieGoal: 2400,
      dailyProteinGoal: 84,
    },
  ]);
  console.log('   👤 Users created (admin + demo user)');

  // Demo meal plan for today for the demo user
  const demo = await User.findOne({ email: 'aarav@example.com' });
  const pick = (name) => createdMeals.find((m) => m.name === name);
  const today = new Date().toISOString().slice(0, 10);

  await MealPlan.create({
    user: demo._id,
    date: today,
    entries: [
      { meal: pick('Oats with Banana & Honey')._id, slot: 'Breakfast', consumed: true },
      { meal: pick('Grilled Chicken Salad')._id, slot: 'Lunch', consumed: true },
      { meal: pick('Paneer Tikka (8 pcs)')._id, slot: 'Dinner', consumed: false },
      { meal: pick('Sprouts Chaat')._id, slot: 'Snack', consumed: false },
    ],
  });
  console.log('   📅 Demo meal plan created for today');

  console.log('\n🎉 Seed complete!');
  console.log('   Admin  → admin@planmyplate.com / admin123');
  console.log('   User   → aarav@example.com / user123\n');

  if (exit) {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Auto-run only when executed directly (npm run seed)
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  seed().catch((err) => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  });
}
