import type { Request, Response, NextFunction } from 'express';
import ContentLibraryItem from '../models/ContentLibraryItem';
import Organization from '../models/Organization';
import Initiative from '../models/Initiative';

export async function createContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, content, category, type, tags, treeType } = req.body;

    // Validation
    if (!title || !content || !category || !type || !treeType) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: title, content, category, type, treeType',
      });
      return;
    }

    if (!['suggestion', 'initiative'].includes(type)) {
      res.status(400).json({
        success: false,
        error: 'Type must be "suggestion" or "initiative"',
      });
      return;
    }

    if (!['inner', 'community', 'outer'].includes(treeType)) {
      res.status(400).json({
        success: false,
        error: 'TreeType must be "inner", "community", or "outer"',
      });
      return;
    }

    const item = await ContentLibraryItem.create({
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      type,
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()) : [],
      treeType,
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function updateContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ success: false, error: 'Invalid ID format' });
      return;
    }

    // Validate type if provided
    if (updates.type && !['suggestion', 'initiative'].includes(updates.type)) {
      res.status(400).json({
        success: false,
        error: 'Type must be "suggestion" or "initiative"',
      });
      return;
    }

    // Validate treeType if provided
    if (updates.treeType && !['inner', 'community', 'outer'].includes(updates.treeType)) {
      res.status(400).json({
        success: false,
        error: 'TreeType must be "inner", "community", or "outer"',
      });
      return;
    }

    // Sanitize string fields
    if (updates.title) updates.title = updates.title.trim();
    if (updates.content) updates.content = updates.content.trim();
    if (updates.category) updates.category = updates.category.trim();
    if (updates.tags) updates.tags = updates.tags.map((t: string) => t.trim());

    const item = await ContentLibraryItem.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      res.status(404).json({ success: false, error: 'Content item not found' });
      return;
    }

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function deleteContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ success: false, error: 'Invalid ID format' });
      return;
    }

    const result = await ContentLibraryItem.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, error: 'Content item not found' });
      return;
    }

    res.json({ success: true, message: 'Content item deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { treeType, type, category, search, limit = '50', skip = '0' } = req.query;

    const filter: Record<string, unknown> = {};

    if (treeType && ['inner', 'community', 'outer'].includes(treeType as string)) {
      filter.treeType = treeType;
    }

    if (type && ['suggestion', 'initiative'].includes(type as string)) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await ContentLibraryItem.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    const total = await ContentLibraryItem.countDocuments(filter);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleOrganizationFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ success: false, error: 'Invalid ID format' });
      return;
    }

    const org = await Organization.findByIdAndUpdate(
      id,
      { featured: !!featured },
      { new: true }
    );

    if (!org) {
      res.status(404).json({ success: false, error: 'Organization not found' });
      return;
    }

    res.json({ success: true, data: org });
  } catch (err) {
    next(err);
  }
}

export async function toggleInitiativeFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ success: false, error: 'Invalid ID format' });
      return;
    }

    const initiative = await Initiative.findByIdAndUpdate(
      id,
      { featured: !!featured },
      { new: true }
    );

    if (!initiative) {
      res.status(404).json({ success: false, error: 'Initiative not found' });
      return;
    }

    res.json({ success: true, data: initiative });
  } catch (err) {
    next(err);
  }
}
