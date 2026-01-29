import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { openDB } from 'idb';

const OfflineContext = createContext();

const DB_NAME = 'cardflow-offline';
const DB_VERSION = 1;

// Initialize IndexedDB
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Workspaces store
      if (!db.objectStoreNames.contains('workspaces')) {
        db.createObjectStore('workspaces', { keyPath: 'workspace_id' });
      }
      // Boards store
      if (!db.objectStoreNames.contains('boards')) {
        const boardStore = db.createObjectStore('boards', { keyPath: 'board_id' });
        boardStore.createIndex('workspace_id', 'workspace_id');
      }
      // Cards store
      if (!db.objectStoreNames.contains('cards')) {
        const cardStore = db.createObjectStore('cards', { keyPath: 'card_id' });
        cardStore.createIndex('board_id', 'board_id');
      }
      // Links store
      if (!db.objectStoreNames.contains('links')) {
        const linkStore = db.createObjectStore('links', { keyPath: 'link_id' });
        linkStore.createIndex('board_id', 'board_id');
      }
      // Pending changes queue
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
      }
    }
  });
};

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [db, setDb] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Initialize DB
  useEffect(() => {
    initDB().then(setDb);
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache data locally
  const cacheData = useCallback(async (storeName, data) => {
    if (!db) return;
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    if (Array.isArray(data)) {
      for (const item of data) {
        await store.put(item);
      }
    } else {
      await store.put(data);
    }
    await tx.done;
  }, [db]);

  // Get cached data
  const getCachedData = useCallback(async (storeName, key = null) => {
    if (!db) return null;
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    
    if (key) {
      return store.get(key);
    }
    return store.getAll();
  }, [db]);

  // Get cached data by index
  const getCachedByIndex = useCallback(async (storeName, indexName, value) => {
    if (!db) return [];
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    return index.getAll(value);
  }, [db]);

  // Delete cached data
  const deleteCachedData = useCallback(async (storeName, key) => {
    if (!db) return;
    const tx = db.transaction(storeName, 'readwrite');
    await tx.objectStore(storeName).delete(key);
    await tx.done;
  }, [db]);

  // Queue pending change for sync
  const queuePendingChange = useCallback(async (change) => {
    if (!db) return;
    const tx = db.transaction('pending', 'readwrite');
    await tx.objectStore('pending').add({
      ...change,
      timestamp: Date.now()
    });
    await tx.done;
    
    // Update pending count
    const count = await db.count('pending');
    setPendingCount(count);
  }, [db]);

  // Get pending changes
  const getPendingChanges = useCallback(async () => {
    if (!db) return [];
    return db.getAll('pending');
  }, [db]);

  // Clear pending change
  const clearPendingChange = useCallback(async (id) => {
    if (!db) return;
    await db.delete('pending', id);
    const count = await db.count('pending');
    setPendingCount(count);
  }, [db]);

  // Clear all cached data for a store
  const clearStore = useCallback(async (storeName) => {
    if (!db) return;
    const tx = db.transaction(storeName, 'readwrite');
    await tx.objectStore(storeName).clear();
    await tx.done;
  }, [db]);

  return (
    <OfflineContext.Provider value={{
      isOnline,
      db,
      pendingCount,
      cacheData,
      getCachedData,
      getCachedByIndex,
      deleteCachedData,
      queuePendingChange,
      getPendingChanges,
      clearPendingChange,
      clearStore
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
