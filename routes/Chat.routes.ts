import express from 'express';
import { chatWithAgent } from '../openai/agent';
import { ChatService } from '../services/Chat.service';
import { Request, Response, NextFunction } from 'express';

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if ((req as any).session && (req as any).session.authenticated) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
}

const router = express.Router();
router.use(requireAuth);

router.post('/message', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });
  // Use session for chat history
  let chatHistory = ChatService.getMessages((req as any).session);
  ChatService.addMessage((req as any).session, 'user', message);
  chatHistory = ChatService.getMessages((req as any).session);
  try {
    const confirmDeleteMatch = message.match(/^confirm delete case (\d+)$/i);
    const cancelDeleteMatch = message.match(/^cancel delete case (\d+)$/i);
    const deleteIdMatch = message.match(/^delete case (\d+)$/i);
    if (deleteIdMatch) {
      const id = Number(deleteIdMatch[1]);
      const { CaseService } = require('../services/Case.service');
      const foundCase = CaseService.findById((req as any).session, id);
      if (!foundCase) {
        ChatService.addMessage((req as any).session, 'assistant', `Case with ID ${id} not found.`);
        return res.json({ response: `Case with ID ${id} not found.` });
      }
      const name = foundCase.name || '';
      const desc = foundCase.description || '(No description provided)';
      const codeBlock = `Case to delete\nID: ${id}\nName: ${name}\nDescription: ${desc}`;
      const confirmMsg = `To confirm deletion, click or respond:\n\n\u0060\u0060\u0060\n${codeBlock}\n\u0060\u0060\u0060\n[Approve](#approve-delete-${id}) [Cancel](#cancel-delete-${id})`;
      ChatService.addMessage((req as any).session, 'assistant', confirmMsg);
      return res.json({ response: confirmMsg });
    }
    if (confirmDeleteMatch) {
      const id = Number(confirmDeleteMatch[1]);
      const { CaseService } = require('../services/Case.service');
      const deleted = CaseService.delete((req as any).session, id);
      if (deleted) {
        ChatService.addMessage((req as any).session, 'assistant', `Case ${id} deleted successfully.`);
        return res.json({ response: `Case ${id} deleted successfully.` });
      } else {
        ChatService.addMessage((req as any).session, 'assistant', `Case ${id} not found or already deleted.`);
        return res.json({ response: `Case ${id} not found or already deleted.` });
      }
    }
    if (cancelDeleteMatch) {
      ChatService.addMessage((req as any).session, 'assistant', `Case deletion cancelled.`);
      return res.json({ response: `Case deletion cancelled.` });
    }
    // Use only the content for chatWithAgent
    const chatForAgent = ChatService.getMessages((req as any).session).map((m: any) => ({ role: m.role, content: m.content }));
    const response = await chatWithAgent(chatForAgent);
    const choice = response.choices?.[0];
    let botMsg = choice?.message?.content || '';
    if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      if (toolCall.function.name === 'createCase') {
        // Parse arguments and call backend logic
        let args;
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch (e) {
          args = {};
        }
        const { name, description } = args;
        if (name && description) {
          // Dynamically import CaseService to avoid circular deps
          const { CaseService } = require('../services/Case.service');
          const newCase = CaseService.create((req as any).session, { name, description });
          botMsg = `Case created: ${newCase.name} (ID: ${newCase.id})`;
        } else {
          botMsg = 'Missing required fields for case creation.';
        }
      } else if (toolCall.function.name === 'deleteCase') {
        let args;
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch (e) {
          args = {};
        }
        const { id } = args;
        if (id) {
          // Dynamically import CaseService to avoid circular deps
          const { CaseService } = require('../services/Case.service');
          const foundCase = CaseService.findById((req as any).session, id);
          if (!foundCase) {
            botMsg = `Case with ID ${id} not found.`;
          } else {
            // Confirmation message in code block style
            botMsg = `Please confirm deletion:\n\n\u0060\u0060\u0060\nID: ${foundCase.id}\nName: ${foundCase.name}\nDescription: ${foundCase.description || ''}\n\u0060\u0060\u0060\n[Approve](#approve-delete-${foundCase.id}) [Cancel](#cancel-delete-${foundCase.id})`;
          }
        } else {
          botMsg = 'Missing case ID for deletion.';
        }
      } else if (toolCall.function.name === 'getCases') {
        const { CaseService } = require('../services/Case.service');
        const cases = CaseService.findAll((req as any).session);
        if (cases.length === 0) {
          botMsg = 'No cases found.';
        } else {
          botMsg = 'All cases:\n' + cases.map((c: any) =>
            `\n\u0060\u0060\u0060\nCase ID: ${c.id}\nName: ${c.name}\nDescription: ${c.description || ''}\n\u0060\u0060\u0060`
          ).join('');
        }
      } else if (toolCall.function.name === 'updateCase') {
        let args;
        try { args = JSON.parse(toolCall.function.arguments); } catch (e) { args = {}; }
        const { id, name, description } = args;
        if (id) {
          const { CaseService } = require('../services/Case.service');
          const updated = CaseService.update((req as any).session, id, { name, description });
          if (updated) {
            botMsg = `Case updated successfully.\n\n\u0060\u0060\u0060\nCase ID: ${updated.id}\nName: ${updated.name}\nDescription: ${updated.description || ''}\n\u0060\u0060\u0060`;
          } else {
            botMsg = `Case with ID ${id} not found.`;
          }
        } else {
          botMsg = 'Missing case ID for update.';
        }
      } else if (toolCall.function.name === 'getNotes') {
        let args;
        try { args = JSON.parse(toolCall.function.arguments); } catch (e) { args = {}; }
        const { case_id } = args;
        if (case_id) {
          const { NoteService } = require('../services/Note.service');
          const notes = NoteService.getNotesByCase((req as any).session, case_id);
          if (notes.length === 0) {
            botMsg = `No notes found for case ${case_id}.`;
          } else {
            botMsg =
              `Notes for case ${case_id}:\n` +
              notes.map((n: any) =>
                `\n\u0060\u0060\u0060\nNote ID: ${n.id}\nCreated: ${n.created_at ? new Date(n.created_at).toLocaleString('en-GB') : ''}\nContent: ${n.content}\n\u0060\u0060\u0060`
              ).join('');
          }
        } else {
          botMsg = 'Missing case_id for getNotes.';
        }
      } else if (toolCall.function.name === 'addNote') {
        let args;
        try { args = JSON.parse(toolCall.function.arguments); } catch (e) { args = {}; }
        const { case_id, content } = args;
        if (case_id && content) {
          const { NoteService } = require('../services/Note.service');
          const note = NoteService.addNote((req as any).session, case_id, content);
          botMsg =
            `Note added to case ${case_id}:\n` +
            `\u0060\u0060\u0060\nNote ID: ${note.id}\nCreated: ${note.created_at ? new Date(note.created_at).toLocaleString('en-GB') : ''}\nContent: ${note.content}\n\u0060\u0060\u0060`;
        } else {
          botMsg = 'Missing case_id or content for addNote.';
        }
      } else {
        botMsg = `Tool call: ${toolCall.function.name} with args ${toolCall.function.arguments}`;
      }
    }
    if (!botMsg) {
      botMsg = 'No response.';
    }
    ChatService.addMessage((req as any).session, 'assistant', botMsg);
    res.json({ response: botMsg });
  } catch (err: any) {
    console.error('[Chat Route Error]', err && (err.stack || err.message || err));
    res.status(500).json({ error: 'Failed to get response from agent.', details: err && (err.stack || err.message || err) });
  }
});

// Endpoint to clear chat history
router.post('/clear', (req, res) => {
  ChatService.clearMessages((req as any).session);
  res.json({ success: true });
});

// Endpoint to get chat history for the current user
router.get('/history', (req, res) => {
  const history = ChatService.getMessages((req as any).session);
  res.json({ history });
});

export default router;
