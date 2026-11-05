import type { Request, Response, NextFunction } from 'express';
import ContentLibraryItem from '../models/ContentLibraryItem';

export async function getExploreItems(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, treeType, category, search } = req.query;

    const filter: any = {};
    if (type) filter.type = type;
    if (treeType) filter.treeType = treeType;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await ContentLibraryItem.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await ContentLibraryItem.distinct('category');

    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}
