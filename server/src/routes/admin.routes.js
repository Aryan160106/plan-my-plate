import { Router } from 'express';
import {
  stats,
  listUsers,
  deleteUser,
  createMeal,
  updateMeal,
  deleteMeal,
  listTickets,
  updateTicket,
} from '../controllers/admin.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/stats', stats);
router.get('/users', listUsers);
router.delete('/users/:id', deleteUser);
router.post('/meals', createMeal);
router.put('/meals/:id', updateMeal);
router.delete('/meals/:id', deleteMeal);
router.get('/tickets', listTickets);
router.put('/tickets/:id', updateTicket);

export default router;
