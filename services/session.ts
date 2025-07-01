import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

// In-memory session store
const sessionStore: Record<string, any> = {};

export function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  let sessionId = req.cookies?.sessionId;
  if (!sessionId) {
    sessionId = randomUUID();
    // Set session cookie (session-only, no expires/max-age)
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      // No expires/maxAge: session cookie
    });
  }
  // Attach session data to request
  if (!sessionStore[sessionId]) {
    sessionStore[sessionId] = {
      authenticated: false, // Passkey provided
      cases: [],            // User's cases
      notes: {},            // Notes per caseId: { [caseId]: [notes] }
      chats: []             // Recent chats
    };
  }
  (req as any).session = sessionStore[sessionId];
  next();
}

export { sessionStore };
