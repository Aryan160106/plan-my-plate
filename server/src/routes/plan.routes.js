import { Router } from 'express';
import { getPlan, addEntry, removeEntry, toggleConsumed, summary } from '../controllers/plan.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getPlan);
router.get('/summary', summary);
router.post('/entries', addEntry);
router.delete('/entries/:entryId', removeEntry);
router.patch('/entries/:entryId/toggle', toggleConsumed);

export default router;
