import type { Request, Response, NextFunction } from 'express';
import Organization from '../models/Organization';

export async function getOrganizations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { type, search, favorites, sort } = req.query;

    const filter: any = { userId };

    if (type && typeof type === 'string' && type !== 'all') {
      filter.type = type;
    }

    if (favorites === 'true') {
      filter.favorites = true;
    }

    if (search && typeof search === 'string') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortField: any = { updatedAt: -1 };
    if (sort === 'name') sortField = { name: 1 };
    else if (sort === 'dateAdded') sortField = { createdAt: -1 };
    else if (sort === 'type') sortField = { type: 1 };

    const organizations = await Organization.find(filter).sort(sortField);

    res.json({ success: true, data: organizations });
  } catch (err) {
    next(err);
  }
}

export async function getOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const organization = await Organization.findOne({ _id: req.params.id, userId });

    if (!organization) {
      res.status(404).json({ success: false, error: 'Organization not found' });
      return;
    }

    res.json({ success: true, data: organization });
  } catch (err) {
    next(err);
  }
}

export async function createOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { name, type, description, website, donationLink, serviceLink, opportunities, address, phone, email, donationUrl, volunteerUrl } = req.body;

    if (!name || !type) {
      res.status(400).json({ success: false, error: 'Name and type are required' });
      return;
    }

    const organization = await Organization.create({
      userId,
      name,
      type,
      description,
      website,
      donationLink,
      serviceLink,
      opportunities: opportunities || [],
      followed: true,
      address,
      phone,
      email,
      donationUrl,
      volunteerUrl,
    });

    res.status(201).json({ success: true, data: organization });
  } catch (err) {
    next(err);
  }
}

export async function updateOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { name, type, description, website, donationLink, serviceLink, opportunities, followed, address, phone, email, donationUrl, volunteerUrl } = req.body;

    const organization = await Organization.findOneAndUpdate(
      { _id: req.params.id, userId },
      { name, type, description, website, donationLink, serviceLink, opportunities, followed, address, phone, email, donationUrl, volunteerUrl },
      { new: true }
    );

    if (!organization) {
      res.status(404).json({ success: false, error: 'Organization not found' });
      return;
    }

    res.json({ success: true, data: organization });
  } catch (err) {
    next(err);
  }
}

export async function toggleFollow(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;

    const organization = await Organization.findOne({ _id: req.params.id, userId });

    if (!organization) {
      res.status(404).json({ success: false, error: 'Organization not found' });
      return;
    }

    organization.followed = !organization.followed;
    await organization.save();

    res.json({ success: true, data: organization });
  } catch (err) {
    next(err);
  }
}

export async function toggleFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;

    const organization = await Organization.findOne({ _id: req.params.id, userId });

    if (!organization) {
      res.status(404).json({ success: false, error: 'Organization not found' });
      return;
    }

    organization.favorites = !organization.favorites;
    await organization.save();

    res.json({ success: true, data: organization });
  } catch (err) {
    next(err);
  }
}

export async function deleteOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;

    const organization = await Organization.findOneAndDelete({ _id: req.params.id, userId });

    if (!organization) {
      res.status(404).json({ success: false, error: 'Organization not found' });
      return;
    }

    res.json({ success: true, message: 'Organization deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// Admin-only endpoints — bypass userId scoping

export async function adminCreateOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, name, type, description, website, donationLink, serviceLink, opportunities, verified, address, phone, email, donationUrl, volunteerUrl } = req.body;

    if (!name || !type) {
      res.status(400).json({ success: false, error: 'Name and type are required' });
      return;
    }

    const organization = await Organization.create({
      userId: userId || (req as any).userId,
      name,
      type,
      description,
      website,
      donationLink,
      serviceLink,
      opportunities: opportunities || [],
      followed: false,
      verified: verified || false,
      address,
      phone,
      email,
      donationUrl,
      volunteerUrl,
    });

    res.status(201).json({ success: true, data: organization });
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updates = req.body;

    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!organization) {
      res.status(404).json({ success: false, error: 'Organization not found' });
      return;
    }

    res.json({ success: true, data: organization });
  } catch (err) {
    next(err);
  }
}

export async function adminDeleteOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const organization = await Organization.findByIdAndDelete(req.params.id);

    if (!organization) {
      res.status(404).json({ success: false, error: 'Organization not found' });
      return;
    }

    res.json({ success: true, message: 'Organization deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function adminSetVerified(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { verified } = req.body;

    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      { verified: !!verified },
      { new: true }
    );

    if (!organization) {
      res.status(404).json({ success: false, error: 'Organization not found' });
      return;
    }

    res.json({ success: true, data: organization });
  } catch (err) {
    next(err);
  }
}
