import type { Request, Response, NextFunction } from 'express';
import * as treeService from '../services/treeService';

export async function getDashboardMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const metrics = await treeService.getDashboardMetrics(userId);

    res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
}

export async function getDashboardSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const summary = await treeService.getDashboardSummary(userId);

    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

export async function getInnerCircleGrowth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const growth = await treeService.calculateInnerCircleGrowth(userId);

    res.json({ success: true, data: growth });
  } catch (err) {
    next(err);
  }
}

export async function getCommunityGrowth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const growth = await treeService.calculateCommunityTreeGrowth(userId);

    res.json({ success: true, data: growth });
  } catch (err) {
    next(err);
  }
}

export async function getOuterCircleGrowth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const growth = await treeService.calculateOuterCircleGrowth(userId);

    res.json({ success: true, data: growth });
  } catch (err) {
    next(err);
  }
}
