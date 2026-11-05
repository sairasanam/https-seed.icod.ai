import express from 'express';
import * as treeController from '../controllers/treeController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', treeController.getDashboardMetrics);
router.get('/dashboard/summary', treeController.getDashboardSummary);
router.get('/inner-circle', treeController.getInnerCircleGrowth);
router.get('/community', treeController.getCommunityGrowth);
router.get('/outer-circle', treeController.getOuterCircleGrowth);

export default router;
