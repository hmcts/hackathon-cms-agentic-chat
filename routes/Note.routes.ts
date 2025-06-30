import express from 'express';
import { NoteService } from '../services/Note.service';
import { CaseService } from '../services/Case.service';

const router = express.Router();

// Add a note to a case
router.post('/:case_id/notes', (req, res) => {
  const case_id = Number(req.params.case_id);
  const { content } = req.body;
  if (!CaseService.findById(case_id)) return res.status(404).json({ message: 'Case not found' });
  if (!content) return res.status(400).json({ message: 'Note content required' });
  const note = NoteService.addNote(case_id, content);
  res.status(201).json(note);
});

// Get all notes for a case
router.get('/:case_id/notes', (req, res) => {
  const case_id = Number(req.params.case_id);
  if (!CaseService.findById(case_id)) return res.status(404).json({ message: 'Case not found' });
  const notes = NoteService.getNotesByCase(case_id);
  res.json(notes);
});

export default router;
