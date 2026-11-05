import express from 'express';
import * as reminderController from '../controllers/reminderController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/', reminderController.getReminders);
router.get('/all', reminderController.getAllReminders);
router.post('/', reminderController.createReminder);
router.put('/:id', reminderController.updateReminder);
router.delete('/:id', reminderController.deleteReminder);
router.post('/:id/snooze', reminderController.snoozeReminder);
router.post('/:id/reschedule', reminderController.rescheduleReminder);

export default router;
