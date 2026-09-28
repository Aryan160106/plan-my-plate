import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    dietPreference: { type: String, enum: ['vegetarian', 'non-vegetarian', 'both'], default: 'both' },
    // Profile / goals
    age: { type: Number, min: 1, max: 120, default: null },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    heightCm: { type: Number, min: 50, max: 250, default: null },
    weightKg: { type: Number, min: 10, max: 300, default: null },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very-active', ''],
      default: '',
    },
    goal: { type: String, enum: ['lose', 'maintain', 'gain', ''], default: '' },
    dailyCalorieGoal: { type: Number, default: 2000 },
    dailyProteinGoal: { type: Number, default: 60 },
  },
  { timestamps: true }
);

// Hash password before saving (only when changed)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare a candidate password with the stored hash
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Remove sensitive fields whenever a user is serialized to JSON
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);
export default User;
