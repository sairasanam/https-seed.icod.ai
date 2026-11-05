import express from 'express';
import * as adminController from '../controllers/adminController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

// Content Library CRUD
router.get('/content', adminController.listContent);
router.post('/content', adminController.createContent);
router.put('/content/:id', adminController.updateContent);
router.delete('/content/:id', adminController.deleteContent);

// Featured toggles
router.patch('/organizations/:id/featured', adminController.toggleOrganizationFeatured);
router.patch('/initiatives/:id/featured', adminController.toggleInitiativeFeatured);

export default router;
