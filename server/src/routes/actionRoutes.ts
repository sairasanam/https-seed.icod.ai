import express from 'express';
import * as actionController from '../controllers/actionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/', actionController.getActions);
router.get('/activity-logs', actionController.getActivityLogs);
router.post('/', actionController.createAction);
router.put('/:id', actionController.updateAction);
router.patch('/:id/complete', actionController.completeAction);
router.post('/:id/undo', actionController.undoAction);
router.post('/:id/postpone', actionController.postponeAction);
router.post('/:id/dismiss', actionController.dismissAction);
router.delete('/:id', actionController.deleteAction);

export default router;
