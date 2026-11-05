import express from 'express';
import * as exploreController from '../controllers/exploreController';

const router = express.Router();

router.get('/', exploreController.getExploreItems);
router.get('/categories', exploreController.getCategories);

export default router;
