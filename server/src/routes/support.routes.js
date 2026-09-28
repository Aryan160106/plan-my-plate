import { Router } from 'express';
import { myTickets, createTicket } from '../controllers/support.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/my', myTickets);
router.post('/', createTicket);

export default router;
