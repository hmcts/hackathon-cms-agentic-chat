import express from 'express';
import { CaseService } from '../services/Case.service';
import { NoteService } from '../services/Note.service';

const router = express.Router();

// CREATE
router.post('/', (req, res) => {
  const newCase = CaseService.create(req.body);
  res.status(201).json(newCase);
});

// READ ALL
router.get('/', (req, res) => {
  const cases = CaseService.findAll();
  res.json(cases);
});

// READ ONE
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const foundCase = CaseService.findById(id);
  if (!foundCase) return res.status(404).json({ message: 'Not found' });
  res.json(foundCase);
});

// --- NOTE ROUTES ---
// Append a note to a case
router.post('/:id/notes', (req, res) => {
  const id = Number(req.params.id);
  const { content } = req.body;
  if (!CaseService.findById(id)) return res.status(404).json({ message: 'Case not found' });
  if (!content) return res.status(400).json({ message: 'Note content required' });
  const note = NoteService.addNote(id, content);
  res.status(201).json(note);
});
// Get all notes for a case
router.get('/:id/notes', (req, res) => {
  const id = Number(req.params.id);
  if (!CaseService.findById(id)) return res.status(404).json({ message: 'Case not found' });
  const notes = NoteService.getNotesByCase(id);
  res.json(notes);
});

// UPDATE
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const updatedCase = CaseService.update(id, req.body);
  if (!updatedCase) return res.status(404).json({ message: 'Not found' });
  res.json(updatedCase);
});

// DELETE
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const deleted = CaseService.delete(id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  NoteService.deleteNotesByCase(id); // Delete all notes for this case
  res.json({ message: 'Case and notes deleted' });
});

export default router;
