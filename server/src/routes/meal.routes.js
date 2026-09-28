import { Router } from 'express';
import { getMeals, getMeal, createMeal, deleteMeal } from '../controllers/meal.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.route('/').get(getMeals).post(createMeal);
router.route('/:id').get(getMeal).delete(deleteMeal);

export default router;
