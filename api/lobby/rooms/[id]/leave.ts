import type { VercelRequest, VercelResponse } from '@vercel/node';
import { leaveRoom } from '../../../../server/routes/lobby';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // Extract id from query params for Vercel's dynamic routing
    req.params = { id: req.query.id as string };
    return leaveRoom(req as any, res as any, () => {});
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
