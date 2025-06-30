// Simple in-memory service for Case CRUD operations
// Replace with database logic as needed

import { Case } from '../models/Case.model';

const cases: Case[] = [];
let nextId = 1;

export const CaseService = {
  create(data: Omit<Case, 'id'>): Case {
    const newCase: Case = { id: nextId++, ...data };
    cases.push(newCase);
    return newCase;
  },
  findAll(): Case[] {
    return cases;
  },
  findById(id: number): Case | undefined {
    return cases.find(c => c.id === id);
  },
  update(id: number, data: Partial<Case>): Case | undefined {
    const foundCase = cases.find(c => c.id === id);
    if (foundCase) {
      Object.assign(foundCase, data);
      return foundCase;
    }
    return undefined;
  },
  delete(id: number): boolean {
    const index = cases.findIndex(c => c.id === id);
    if (index !== -1) {
      cases.splice(index, 1);
      return true;
    }
    return false;
  },
};
