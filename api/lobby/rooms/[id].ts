import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom } from '../../../server/routes/lobby';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // Extract id from query params for Vercel's dynamic routing
    req.params = { id: req.query.id as string };
    return getRoom(req as any, res as any, () => {});
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
