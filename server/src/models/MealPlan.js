import mongoose from 'mongoose';

const planEntrySchema = new mongoose.Schema(
  {
    meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true },
    slot: { type: String, required: true, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
    servings: { type: Number, default: 1, min: 1, max: 10 },
    consumed: { type: Boolean, default: false },
  },
  { _id: true }
);

const mealPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    entries: { type: [planEntrySchema], default: [] },
  },
  { timestamps: true }
);

// One plan document per user per day
mealPlanSchema.index({ user: 1, date: 1 }, { unique: true });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
export default MealPlan;
