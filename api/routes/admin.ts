import { Router, Request, Response } from 'express';
import { getSupabaseClient } from '../middleware/auth';

const router = Router();

const VALID_ROLES = ['guest', 'member', 'guide', 'admin'];

// GET /api/admin/users - List all users
router.get('/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
      return;
    }

    const users = data.users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.user_metadata?.role ?? 'guest',
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at,
    }));

    res.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/users/:id/role - Update a user's role
router.patch('/users/:id/role', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !VALID_ROLES.includes(role)) {
      res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { role },
    });

    if (error) {
      res.status(500).json({ error: 'Failed to update user role' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
