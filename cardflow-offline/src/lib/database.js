// SQLite Database using sql.js (works in browser and Electron/Tauri)
import initSqlJs from 'sql.js';

let db = null;
let SQL = null;

// Initialize SQLite database
export async function initDatabase() {
  if (db) return db;

  SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });

  // Try to load existing database from localStorage
  const savedDb = localStorage.getItem('cardflow-db');
  if (savedDb) {
    const uint8Array = new Uint8Array(JSON.parse(savedDb));
    db = new SQL.Database(uint8Array);
  } else {
    db = new SQL.Database();
    createTables();
  }

  return db;
}

// Create database tables
function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      password_hash TEXT,
      picture TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS workspaces (
      workspace_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      color TEXT DEFAULT '#4F46E5',
      owner_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(user_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS boards (
      board_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      workspace_id TEXT,
      owner_id TEXT,
      statuses TEXT DEFAULT '[]',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(workspace_id),
      FOREIGN KEY (owner_id) REFERENCES users(user_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cards (
      card_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      card_type TEXT DEFAULT 'task',
      status TEXT DEFAULT 'idea',
      board_id TEXT,
      position_x REAL DEFAULT 0,
      position_y REAL DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      assignees TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      due_date TEXT,
      checklist TEXT DEFAULT '[]',
      color TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (board_id) REFERENCES boards(board_id),
      FOREIGN KEY (created_by) REFERENCES users(user_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS links (
      link_id TEXT PRIMARY KEY,
      source_card_id TEXT,
      target_card_id TEXT,
      link_type TEXT DEFAULT 'related_to',
      label TEXT,
      color TEXT DEFAULT '#6B7280',
      line_style TEXT DEFAULT 'solid',
      board_id TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (source_card_id) REFERENCES cards(card_id),
      FOREIGN KEY (target_card_id) REFERENCES cards(card_id),
      FOREIGN KEY (board_id) REFERENCES boards(board_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  saveDatabase();
}

// Save database to localStorage
export function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const arr = Array.from(data);
  localStorage.setItem('cardflow-db', JSON.stringify(arr));
}

// Generate UUID
export function generateId(prefix = '') {
  return `${prefix}${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

// Default statuses for new boards
const DEFAULT_STATUSES = JSON.stringify([
  { name: 'Idea', color: '#FBBF24', order: 0 },
  { name: 'Planned', color: '#60A5FA', order: 1 },
  { name: 'In Progress', color: '#34D399', order: 2 },
  { name: 'Testing', color: '#A78BFA', order: 3 },
  { name: 'Done', color: '#10B981', order: 4 },
  { name: 'Archived', color: '#6B7280', order: 5 }
]);

// ==================== USER OPERATIONS ====================

export function createUser(email, name, passwordHash = null) {
  const userId = generateId('user_');
  const now = new Date().toISOString();
  
  db.run(
    `INSERT INTO users (user_id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)`,
    [userId, email, name, passwordHash, now]
  );
  saveDatabase();
  
  return { user_id: userId, email, name };
}

export function getUserByEmail(email) {
  const result = db.exec(`SELECT * FROM users WHERE email = ?`, [email]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  return columns.reduce((obj, col, i) => ({ ...obj, [col]: values[i] }), {});
}

export function getCurrentUser() {
  const userId = localStorage.getItem('cardflow-user-id');
  if (!userId) return null;
  
  const result = db.exec(`SELECT user_id, email, name, picture FROM users WHERE user_id = ?`, [userId]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  return columns.reduce((obj, col, i) => ({ ...obj, [col]: values[i] }), {});
}

export function setCurrentUser(userId) {
  localStorage.setItem('cardflow-user-id', userId);
}

export function clearCurrentUser() {
  localStorage.removeItem('cardflow-user-id');
}

// ==================== WORKSPACE OPERATIONS ====================

export function createWorkspace(name, description = '', color = '#4F46E5', ownerId) {
  const workspaceId = generateId('ws_');
  const now = new Date().toISOString();
  
  db.run(
    `INSERT INTO workspaces (workspace_id, name, description, color, owner_id, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [workspaceId, name, description, color, ownerId, now, now]
  );
  saveDatabase();
  
  return {
    workspace_id: workspaceId,
    name,
    description,
    color,
    owner_id: ownerId,
    created_at: now,
    updated_at: now
  };
}

export function getWorkspaces(ownerId) {
  const result = db.exec(`SELECT * FROM workspaces WHERE owner_id = ? ORDER BY created_at DESC`, [ownerId]);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => 
    columns.reduce((obj, col, i) => ({ ...obj, [col]: row[i] }), {})
  );
}

export function getWorkspace(workspaceId) {
  const result = db.exec(`SELECT * FROM workspaces WHERE workspace_id = ?`, [workspaceId]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  return columns.reduce((obj, col, i) => ({ ...obj, [col]: values[i] }), {});
}

export function deleteWorkspace(workspaceId) {
  // Delete all cards and links in boards of this workspace
  const boards = getBoards(workspaceId);
  boards.forEach(board => {
    db.run(`DELETE FROM links WHERE board_id = ?`, [board.board_id]);
    db.run(`DELETE FROM cards WHERE board_id = ?`, [board.board_id]);
  });
  
  db.run(`DELETE FROM boards WHERE workspace_id = ?`, [workspaceId]);
  db.run(`DELETE FROM workspaces WHERE workspace_id = ?`, [workspaceId]);
  saveDatabase();
}

// ==================== BOARD OPERATIONS ====================

export function createBoard(name, description = '', workspaceId, ownerId) {
  const boardId = generateId('board_');
  const now = new Date().toISOString();
  
  db.run(
    `INSERT INTO boards (board_id, name, description, workspace_id, owner_id, statuses, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [boardId, name, description, workspaceId, ownerId, DEFAULT_STATUSES, now, now]
  );
  saveDatabase();
  
  return {
    board_id: boardId,
    name,
    description,
    workspace_id: workspaceId,
    owner_id: ownerId,
    statuses: JSON.parse(DEFAULT_STATUSES),
    created_at: now,
    updated_at: now
  };
}

export function getBoards(workspaceId = null, ownerId = null) {
  let query = `SELECT * FROM boards WHERE 1=1`;
  const params = [];
  
  if (workspaceId) {
    query += ` AND workspace_id = ?`;
    params.push(workspaceId);
  }
  if (ownerId) {
    query += ` AND owner_id = ?`;
    params.push(ownerId);
  }
  query += ` ORDER BY created_at DESC`;
  
  const result = db.exec(query, params);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = columns.reduce((o, col, i) => ({ ...o, [col]: row[i] }), {});
    obj.statuses = JSON.parse(obj.statuses || '[]');
    return obj;
  });
}

export function getBoard(boardId) {
  const result = db.exec(`SELECT * FROM boards WHERE board_id = ?`, [boardId]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const obj = columns.reduce((o, col, i) => ({ ...o, [col]: values[i] }), {});
  obj.statuses = JSON.parse(obj.statuses || '[]');
  return obj;
}

export function updateBoard(boardId, updates) {
  const now = new Date().toISOString();
  const fields = [];
  const values = [];
  
  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'board_id' && key !== 'owner_id' && key !== 'workspace_id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(key === 'statuses' ? JSON.stringify(value) : value);
    }
  });
  
  fields.push('updated_at = ?');
  values.push(now);
  values.push(boardId);
  
  db.run(`UPDATE boards SET ${fields.join(', ')} WHERE board_id = ?`, values);
  saveDatabase();
}

export function deleteBoard(boardId) {
  db.run(`DELETE FROM links WHERE board_id = ?`, [boardId]);
  db.run(`DELETE FROM cards WHERE board_id = ?`, [boardId]);
  db.run(`DELETE FROM boards WHERE board_id = ?`, [boardId]);
  saveDatabase();
}

// ==================== CARD OPERATIONS ====================

export function createCard(data) {
  const cardId = generateId('card_');
  const now = new Date().toISOString();
  
  db.run(
    `INSERT INTO cards (card_id, title, description, card_type, status, board_id, position_x, position_y, 
     priority, assignees, tags, due_date, checklist, color, created_by, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      cardId,
      data.title,
      data.description || '',
      data.card_type || 'task',
      data.status || 'idea',
      data.board_id,
      data.position_x || 0,
      data.position_y || 0,
      data.priority || 'medium',
      JSON.stringify(data.assignees || []),
      JSON.stringify(data.tags || []),
      data.due_date || null,
      JSON.stringify(data.checklist || []),
      data.color || null,
      data.created_by,
      now,
      now
    ]
  );
  saveDatabase();
  
  return {
    card_id: cardId,
    ...data,
    assignees: data.assignees || [],
    tags: data.tags || [],
    checklist: data.checklist || [],
    created_at: now,
    updated_at: now
  };
}

export function getCards(boardId) {
  const result = db.exec(`SELECT * FROM cards WHERE board_id = ?`, [boardId]);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = columns.reduce((o, col, i) => ({ ...o, [col]: row[i] }), {});
    obj.assignees = JSON.parse(obj.assignees || '[]');
    obj.tags = JSON.parse(obj.tags || '[]');
    obj.checklist = JSON.parse(obj.checklist || '[]');
    return obj;
  });
}

export function getCard(cardId) {
  const result = db.exec(`SELECT * FROM cards WHERE card_id = ?`, [cardId]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const obj = columns.reduce((o, col, i) => ({ ...o, [col]: values[i] }), {});
  obj.assignees = JSON.parse(obj.assignees || '[]');
  obj.tags = JSON.parse(obj.tags || '[]');
  obj.checklist = JSON.parse(obj.checklist || '[]');
  return obj;
}

export function updateCard(cardId, updates) {
  const now = new Date().toISOString();
  const fields = [];
  const values = [];
  
  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'card_id' && key !== 'created_by' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      if (key === 'assignees' || key === 'tags' || key === 'checklist') {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
    }
  });
  
  fields.push('updated_at = ?');
  values.push(now);
  values.push(cardId);
  
  db.run(`UPDATE cards SET ${fields.join(', ')} WHERE card_id = ?`, values);
  saveDatabase();
  
  return getCard(cardId);
}

export function deleteCard(cardId) {
  db.run(`DELETE FROM links WHERE source_card_id = ? OR target_card_id = ?`, [cardId, cardId]);
  db.run(`DELETE FROM cards WHERE card_id = ?`, [cardId]);
  saveDatabase();
}

// ==================== LINK OPERATIONS ====================

export function createLink(data) {
  const linkId = generateId('link_');
  const now = new Date().toISOString();
  
  // Get board_id from source card
  const sourceCard = getCard(data.source_card_id);
  if (!sourceCard) throw new Error('Source card not found');
  
  db.run(
    `INSERT INTO links (link_id, source_card_id, target_card_id, link_type, label, color, line_style, board_id, created_by, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      linkId,
      data.source_card_id,
      data.target_card_id,
      data.link_type || 'related_to',
      data.label || null,
      data.color || '#6B7280',
      data.line_style || 'solid',
      sourceCard.board_id,
      data.created_by,
      now
    ]
  );
  saveDatabase();
  
  return {
    link_id: linkId,
    ...data,
    board_id: sourceCard.board_id,
    created_at: now
  };
}

export function getLinks(boardId) {
  const result = db.exec(`SELECT * FROM links WHERE board_id = ?`, [boardId]);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => 
    columns.reduce((obj, col, i) => ({ ...obj, [col]: row[i] }), {})
  );
}

export function deleteLink(linkId) {
  db.run(`DELETE FROM links WHERE link_id = ?`, [linkId]);
  saveDatabase();
}

// ==================== SEARCH ====================

export function searchCards(query, boardId = null, ownerId = null) {
  let sql = `SELECT * FROM cards WHERE (title LIKE ? OR description LIKE ?)`;
  const params = [`%${query}%`, `%${query}%`];
  
  if (boardId) {
    sql += ` AND board_id = ?`;
    params.push(boardId);
  }
  if (ownerId) {
    sql += ` AND created_by = ?`;
    params.push(ownerId);
  }
  
  const result = db.exec(sql, params);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = columns.reduce((o, col, i) => ({ ...o, [col]: row[i] }), {});
    obj.assignees = JSON.parse(obj.assignees || '[]');
    obj.tags = JSON.parse(obj.tags || '[]');
    obj.checklist = JSON.parse(obj.checklist || '[]');
    return obj;
  });
}

// ==================== EXPORT/IMPORT ====================

export function exportBoard(boardId) {
  const board = getBoard(boardId);
  const cards = getCards(boardId);
  const links = getLinks(boardId);
  
  return {
    board,
    cards,
    links,
    exported_at: new Date().toISOString()
  };
}

export function importBoard(data, workspaceId, ownerId) {
  const { board: boardData, cards: cardsData, links: linksData } = data;
  
  // Create new board
  const newBoard = createBoard(
    boardData.name || 'Imported Board',
    boardData.description || '',
    workspaceId,
    ownerId
  );
  
  if (boardData.statuses) {
    updateBoard(newBoard.board_id, { statuses: boardData.statuses });
  }
  
  // Map old card IDs to new ones
  const cardIdMap = {};
  
  cardsData.forEach(card => {
    const newCard = createCard({
      ...card,
      board_id: newBoard.board_id,
      created_by: ownerId
    });
    cardIdMap[card.card_id] = newCard.card_id;
  });
  
  // Create links with new IDs
  linksData.forEach(link => {
    if (cardIdMap[link.source_card_id] && cardIdMap[link.target_card_id]) {
      createLink({
        source_card_id: cardIdMap[link.source_card_id],
        target_card_id: cardIdMap[link.target_card_id],
        link_type: link.link_type,
        label: link.label,
        color: link.color,
        line_style: link.line_style,
        created_by: ownerId
      });
    }
  });
  
  return newBoard;
}

// ==================== SETTINGS ====================

export function getSetting(key) {
  const result = db.exec(`SELECT value FROM settings WHERE key = ?`, [key]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  return result[0].values[0][0];
}

export function setSetting(key, value) {
  db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
  saveDatabase();
}

// Export database as file
export function exportDatabaseFile() {
  if (!db) return null;
  const data = db.export();
  return new Blob([data], { type: 'application/octet-stream' });
}

// Import database from file
export async function importDatabaseFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });
  }
  
  db = new SQL.Database(uint8Array);
  saveDatabase();
  return true;
}
