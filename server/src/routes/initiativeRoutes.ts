import express from 'express';
import * as initiativeController from '../controllers/initiativeController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

// Templates must come before /:id to avoid route conflicts
router.get('/templates', initiativeController.getTemplates);
router.post('/from-template/:templateId', initiativeController.createFromTemplate);

router.get('/', initiativeController.getInitiatives);
router.get('/:id', initiativeController.getInitiative);
router.post('/', initiativeController.createInitiative);
router.put('/:id', initiativeController.updateInitiative);
router.delete('/:id', initiativeController.deleteInitiative);

// Archive
router.patch('/:id/archive', initiativeController.archiveInitiative);

// Tasks
router.post('/:id/tasks', initiativeController.addTask);
router.patch('/:id/tasks/:taskId', initiativeController.toggleTask);
router.delete('/:id/tasks/:taskId', initiativeController.removeTask);

export default router;
