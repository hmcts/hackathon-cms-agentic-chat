import { Note } from '../models/Note.model';

let notes: Note[] = [];
let nextNoteId = 1;

export const NoteService = {
  addNote(case_id: number, content: string): Note {
    const note: Note = {
      id: nextNoteId++,
      case_id,
      content,
      created_at: new Date().toISOString(),
    };
    notes.push(note);
    return note;
  },
  getNotesByCase(case_id: number): Note[] {
    return notes.filter(n => n.case_id === case_id);
  },
  deleteNotesByCase(case_id: number): void {
    notes = notes.filter(n => n.case_id !== case_id);
  },
};
