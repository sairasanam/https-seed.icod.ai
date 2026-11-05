import express from 'express';
import * as organizationController from '../controllers/organizationController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

// Admin routes — must come before /:id to avoid conflicts
router.post('/admin', requireAdmin, organizationController.adminCreateOrganization);
router.put('/admin/:id', requireAdmin, organizationController.adminUpdateOrganization);
router.delete('/admin/:id', requireAdmin, organizationController.adminDeleteOrganization);
router.patch('/admin/:id/verify', requireAdmin, organizationController.adminSetVerified);

// User routes
router.get('/', organizationController.getOrganizations);
router.get('/:id', organizationController.getOrganization);
router.post('/', organizationController.createOrganization);
router.put('/:id', organizationController.updateOrganization);
router.patch('/:id/follow', organizationController.toggleFollow);
router.patch('/:id/favorite', organizationController.toggleFavorite);
router.delete('/:id', organizationController.deleteOrganization);

export default router;
