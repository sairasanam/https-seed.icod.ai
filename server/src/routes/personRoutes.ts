import express from 'express';
import * as personController from '../controllers/personController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/', personController.getPeople);
router.get('/:id', personController.getPerson);
router.post('/', personController.createPerson);
router.put('/:id', personController.updatePerson);
router.delete('/:id', personController.deletePerson);

export default router;
