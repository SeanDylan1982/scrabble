import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGameStateHandler } from '../../../server/routes/game';
import { ensureDbInitialized } from '../../_init-db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureDbInitialized();
  if (req.method === 'GET') {
    // Extract id from query params for Vercel's dynamic routing
    req.params = { id: req.query.id as string };
    return getGameStateHandler(req as any, res as any, () => {});
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
