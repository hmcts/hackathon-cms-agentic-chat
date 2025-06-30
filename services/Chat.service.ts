// services/Chat.service.ts

export interface ChatMessage {
  id: number;
  user_id: string;
  role: string;
  content: string;
  timestamp: number;
}

let chatMessages: ChatMessage[] = [];
let nextChatId = 1;

export const ChatService = {
  addMessage(user_id: string, role: string, content: string): ChatMessage {
    const message: ChatMessage = {
      id: nextChatId++,
      user_id,
      role,
      content,
      timestamp: Date.now(),
    };
    chatMessages.push(message);
    return message;
  },

  getMessagesByUser(user_id: string): ChatMessage[] {
    return chatMessages.filter(m => m.user_id === user_id);
  },

  clearMessagesByUser(user_id: string): void {
    chatMessages = chatMessages.filter(m => m.user_id !== user_id);
  },
};
