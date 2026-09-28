import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: '', trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
    },
    dietType: { type: String, required: true, enum: ['Vegetarian', 'Non-Vegetarian'] },
    emoji: { type: String, default: '🍽️' },
    // Nutrition per serving
    calories: { type: Number, required: true, min: 0 },
    protein: { type: Number, required: true, min: 0 },
    carbs: { type: Number, required: true, min: 0 },
    fats: { type: Number, required: true, min: 0 },
    fiber: { type: Number, default: 0, min: 0 },
    servingLabel: { type: String, default: '1 serving' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

mealSchema.index({ name: 'text', description: 'text' });

const Meal = mongoose.model('Meal', mealSchema);
export default Meal;
