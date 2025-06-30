export interface Case {
    id: number;
    name: string;
    description?: string;
    client_id?: number;
    attorney_id?: number;
    court_id?: number;
    status?: string;
    opened_at?: string;
    closed_at?: string;
    // Optional: notes are managed in NoteService, but can be referenced here
    notes?: import('./Note.model').Note[];
}
