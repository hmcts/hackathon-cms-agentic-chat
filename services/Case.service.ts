// Simple in-memory service for Case CRUD operations
// Replace with database logic as needed

import { Case } from '../models/Case.model';

export const CaseService = {
  create(session: any, data: Omit<Case, 'id'>): Case {
    if (!session.cases) session.cases = [];
    if (!session.nextCaseId) session.nextCaseId = 1;
    const newCase: Case = { id: session.nextCaseId++, ...data };
    session.cases.push(newCase);
    return newCase;
  },
  findAll(session: any): Case[] {
    return session.cases || [];
  },
  findById(session: any, id: number): Case | undefined {
    return (session.cases || []).find((c: Case) => c.id === id);
  },
  update(session: any, id: number, data: Partial<Case>): Case | undefined {
    const foundCase = (session.cases || []).find((c: Case) => c.id === id);
    if (foundCase) {
      Object.assign(foundCase, data);
      return foundCase;
    }
    return undefined;
  },
  delete(session: any, id: number): boolean {
    const index = (session.cases || []).findIndex((c: Case) => c.id === id);
    if (index !== -1) {
      session.cases.splice(index, 1);
      return true;
    }
    return false;
  },
};
