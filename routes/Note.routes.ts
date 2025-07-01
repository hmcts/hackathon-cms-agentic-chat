import express from 'express';
import { NoteService } from '../services/Note.service';
import { CaseService } from '../services/Case.service';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if ((req as any).session && (req as any).session.authenticated) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
}

router.use(requireAuth);

// Add a note to a case
router.post('/:case_id/notes', (req, res) => {
  const case_id = Number(req.params.case_id);
  const { content } = req.body;
  if (!CaseService.findById((req as any).session, case_id)) return res.status(404).json({ message: 'Case not found' });
  if (!content) return res.status(400).json({ message: 'Note content required' });
  const note = NoteService.addNote((req as any).session, case_id, content);
  res.status(201).json(note);
});

// Get all notes for a case
router.get('/:case_id/notes', (req, res) => {
  const case_id = Number(req.params.case_id);
  if (!CaseService.findById((req as any).session, case_id)) return res.status(404).json({ message: 'Case not found' });
  const notes = NoteService.getNotesByCase((req as any).session, case_id);
  res.json(notes);
});

export default router;
