import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import api from '@/services/api';
import { useAuthStore } from './authStore';

export interface ChatUser {
  _id: string;
  fullName: string;
  avatar?: string;
}

export interface Conversation {
  _id: string;
  participants: ChatUser[];
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatState {
  socket: Socket | null;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  
  connectSocket: () => void;
  disconnectSocket: () => void;
  fetchConversations: () => Promise<void>;
  setActiveConversation: (conversation: Conversation) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => void;
  startConversation: (participantId: string) => Promise<Conversation | null>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,

  connectSocket: () => {
    const { socket } = get();
    if (socket) return;

    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001', {
      auth: {
        token,
      },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('newMessage', (message: Message) => {
      const { activeConversation, conversations } = get();
      
      // Update messages list if active
      if (activeConversation && activeConversation._id === message.conversationId) {
        set((state) => ({ messages: [...state.messages, message] }));
      }

      // Update conversations list (lastMessage)
      set((state) => ({
        conversations: state.conversations.map(conv => {
          if (conv._id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message.content,
              lastMessageAt: message.createdAt,
            };
          }
          return conv;
        }).sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime())
      }));
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  fetchConversations: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/chat/conversations') as any;
      set({ conversations: res.data || [], isLoading: false });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      set({ isLoading: false });
    }
  },

  setActiveConversation: (conversation: Conversation) => {
    set({ activeConversation: conversation });
    get().fetchMessages(conversation._id);
  },

  fetchMessages: async (conversationId: string) => {
    try {
      set({ isLoading: true });
      const res = await api.get(`/chat/conversations/${conversationId}/messages`) as any;
      set({ messages: res.data || [], isLoading: false });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      set({ isLoading: false });
    }
  },

  sendMessage: (content: string) => {
    const { socket, activeConversation } = get();
    if (!socket || !activeConversation) return;

    socket.emit('sendMessage', {
      conversationId: activeConversation._id,
      content,
    });
  },

  startConversation: async (participantId: string) => {
    try {
      const res = await api.post('/chat/conversations', { participantId }) as any;
      const conversation = res.data;
      if (conversation) {
        set((state) => {
          const exists = state.conversations.find(c => c._id === conversation._id);
          if (exists) return { activeConversation: exists };
          return {
            conversations: [conversation, ...state.conversations],
            activeConversation: conversation
          };
        });
        get().fetchMessages(conversation._id);
      }
      return conversation;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      return null;
    }
  }
}));
