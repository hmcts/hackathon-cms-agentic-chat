import { Note } from '../models/Note.model';

export const NoteService = {
  addNote(session: any, case_id: number, content: string): Note {
    if (!session.notes) session.notes = {};
    if (!session.nextNoteId) session.nextNoteId = 1;
    if (!session.notes[case_id]) session.notes[case_id] = [];
    const note: Note = {
      id: session.nextNoteId++,
      case_id,
      content,
      created_at: new Date().toISOString(),
    };
    session.notes[case_id].push(note);
    return note;
  },
  getNotesByCase(session: any, case_id: number): Note[] {
    return (session.notes && session.notes[case_id]) ? session.notes[case_id] : [];
  },
  deleteNotesByCase(session: any, case_id: number): void {
    if (session.notes && session.notes[case_id]) {
      delete session.notes[case_id];
    }
  },
};
