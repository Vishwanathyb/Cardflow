import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as db from '../lib/database';

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: true,

      initialize: async () => {
        await db.initDatabase();
        const user = db.getCurrentUser();
        set({ user, isAuthenticated: !!user, loading: false });
      },

      login: (email, password) => {
        const user = db.getUserByEmail(email);
        if (!user) throw new Error('User not found');
        // In offline mode, we trust the local user
        db.setCurrentUser(user.user_id);
        set({ user, isAuthenticated: true });
        return user;
      },

      register: (email, name, password) => {
        const existing = db.getUserByEmail(email);
        if (existing) throw new Error('Email already registered');
        
        const user = db.createUser(email, name, password);
        db.setCurrentUser(user.user_id);
        set({ user, isAuthenticated: true });
        return user;
      },

      logout: () => {
        db.clearCurrentUser();
        set({ user: null, isAuthenticated: false });
      }
    }),
    {
      name: 'cardflow-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);

// Workspace Store
export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  selectedWorkspace: null,
  loading: false,

  fetchWorkspaces: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    const workspaces = db.getWorkspaces(user.user_id);
    set({ workspaces });
    
    if (workspaces.length > 0 && !get().selectedWorkspace) {
      set({ selectedWorkspace: workspaces[0] });
    }
  },

  createWorkspace: (name, color = '#4F46E5') => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');
    
    const workspace = db.createWorkspace(name, '', color, user.user_id);
    set(state => ({
      workspaces: [...state.workspaces, workspace],
      selectedWorkspace: workspace
    }));
    return workspace;
  },

  deleteWorkspace: (workspaceId) => {
    db.deleteWorkspace(workspaceId);
    set(state => {
      const workspaces = state.workspaces.filter(w => w.workspace_id !== workspaceId);
      return {
        workspaces,
        selectedWorkspace: state.selectedWorkspace?.workspace_id === workspaceId 
          ? workspaces[0] || null 
          : state.selectedWorkspace
      };
    });
  },

  selectWorkspace: (workspace) => {
    set({ selectedWorkspace: workspace });
  }
}));

// Board Store
export const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoard: null,
  loading: false,

  fetchBoards: (workspaceId = null) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    const boards = db.getBoards(workspaceId, user.user_id);
    set({ boards });
  },

  fetchBoard: (boardId) => {
    const board = db.getBoard(boardId);
    set({ currentBoard: board });
    return board;
  },

  createBoard: (name, workspaceId) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');
    
    const board = db.createBoard(name, '', workspaceId, user.user_id);
    set(state => ({ boards: [...state.boards, board] }));
    return board;
  },

  updateBoard: (boardId, updates) => {
    db.updateBoard(boardId, updates);
    set(state => ({
      boards: state.boards.map(b => b.board_id === boardId ? { ...b, ...updates } : b),
      currentBoard: state.currentBoard?.board_id === boardId 
        ? { ...state.currentBoard, ...updates } 
        : state.currentBoard
    }));
  },

  deleteBoard: (boardId) => {
    db.deleteBoard(boardId);
    set(state => ({
      boards: state.boards.filter(b => b.board_id !== boardId),
      currentBoard: state.currentBoard?.board_id === boardId ? null : state.currentBoard
    }));
  }
}));

// Card Store
export const useCardStore = create((set, get) => ({
  cards: [],
  selectedCard: null,

  fetchCards: (boardId) => {
    const cards = db.getCards(boardId);
    set({ cards });
  },

  createCard: (data) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');
    
    const card = db.createCard({ ...data, created_by: user.user_id });
    set(state => ({ cards: [...state.cards, card] }));
    return card;
  },

  updateCard: (cardId, updates) => {
    const updatedCard = db.updateCard(cardId, updates);
    set(state => ({
      cards: state.cards.map(c => c.card_id === cardId ? updatedCard : c),
      selectedCard: state.selectedCard?.card_id === cardId ? updatedCard : state.selectedCard
    }));
    return updatedCard;
  },

  deleteCard: (cardId) => {
    db.deleteCard(cardId);
    set(state => ({
      cards: state.cards.filter(c => c.card_id !== cardId),
      selectedCard: state.selectedCard?.card_id === cardId ? null : state.selectedCard
    }));
  },

  selectCard: (card) => {
    set({ selectedCard: card });
  },

  clearSelection: () => {
    set({ selectedCard: null });
  }
}));

// Link Store
export const useLinkStore = create((set, get) => ({
  links: [],

  fetchLinks: (boardId) => {
    const links = db.getLinks(boardId);
    set({ links });
  },

  createLink: (data) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');
    
    const link = db.createLink({ ...data, created_by: user.user_id });
    set(state => ({ links: [...state.links, link] }));
    return link;
  },

  deleteLink: (linkId) => {
    db.deleteLink(linkId);
    set(state => ({ links: state.links.filter(l => l.link_id !== linkId) }));
  }
}));

// Theme Store
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme })
    }),
    { name: 'cardflow-theme' }
  )
);
