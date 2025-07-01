import express from 'express';
import { CaseService } from '../services/Case.service';
import { NoteService } from '../services/Note.service';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if ((req as any).session && (req as any).session.authenticated) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
}

router.use(requireAuth);

// CREATE
router.post('/', (req, res) => {
  const newCase = CaseService.create((req as any).session, req.body);
  res.status(201).json(newCase);
});

// READ ALL
router.get('/', (req, res) => {
  const cases = CaseService.findAll((req as any).session);
  res.json(cases);
});

// READ ONE
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const foundCase = CaseService.findById((req as any).session, id);
  if (!foundCase) return res.status(404).json({ message: 'Not found' });
  res.json(foundCase);
});

// --- NOTE ROUTES ---
// Append a note to a case
router.post('/:id/notes', (req, res) => {
  const id = Number(req.params.id);
  if (!CaseService.findById((req as any).session, id)) return res.status(404).json({ message: 'Case not found' });
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Note content required' });
  const note = NoteService.addNote((req as any).session, id, content);
  res.status(201).json(note);
});
// Get all notes for a case
router.get('/:id/notes', (req, res) => {
  const id = Number(req.params.id);
  if (!CaseService.findById((req as any).session, id)) return res.status(404).json({ message: 'Case not found' });
  const notes = NoteService.getNotesByCase((req as any).session, id);
  res.json(notes);
});

// UPDATE
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const updatedCase = CaseService.update((req as any).session, id, req.body);
  if (!updatedCase) return res.status(404).json({ message: 'Not found' });
  res.json(updatedCase);
});

// DELETE
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const deleted = CaseService.delete((req as any).session, id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  NoteService.deleteNotesByCase((req as any).session, id); // Delete all notes for this case
  res.json({ message: 'Case and notes deleted' });
});

export default router;
