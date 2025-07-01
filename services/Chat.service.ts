// services/Chat.service.ts

export interface ChatMessage {
  id: number;
  user_id: string;
  role: string;
  content: string;
  timestamp: number;
}

export const ChatService = {
  addMessage(session: any, role: string, content: string): ChatMessage {
    if (!session.chats) session.chats = [];
    if (!session.nextChatId) session.nextChatId = 1;
    const message: ChatMessage = {
      id: session.nextChatId++,
      user_id: session.sessionId || 'unknown',
      role,
      content,
      timestamp: Date.now(),
    };
    session.chats.push(message);
    return message;
  },

  getMessages(session: any): ChatMessage[] {
    return session.chats || [];
  },

  clearMessages(session: any): void {
    session.chats = [];
  },
};
