import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getStore } from '@netlify/blobs';
import { DecisionAnalysis } from '../src/types';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DecisionRecord {
  id: string;
  userId: string;
  title: string;
  originalPrompt: string;
  analysis: DecisionAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  decisions: DecisionRecord[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists for local disk fallback
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Read-only filesystem in some serverless environments
}

function getBlobStore() {
  try {
    return getStore('tiebreaker_db');
  } catch (e) {
    return null;
  }
}

function loadDatabaseFromDisk(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content);
      return {
        users: Array.isArray(data.users) ? data.users : [],
        decisions: Array.isArray(data.decisions) ? data.decisions : [],
      };
    }
  } catch (err) {
    // Disk read failed or directory read-only
  }
  return { users: [], decisions: [] };
}

function saveDatabaseToDisk(data: DatabaseSchema): void {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    // Read-only filesystem in serverless mode, handled by Netlify Blobs
  }
}

// In-memory cache synced with storage
let dbCache: DatabaseSchema = loadDatabaseFromDisk();

/**
 * Sync database from Netlify Blobs or Local Disk
 */
export async function syncDatabaseFromStorage(): Promise<DatabaseSchema> {
  const diskData = loadDatabaseFromDisk();

  try {
    const store = getBlobStore();
    if (store) {
      const data = (await store.get('schema', { type: 'json' })) as DatabaseSchema | null;
      if (data && Array.isArray(data.users) && data.users.length > 0) {
        // Merge disk & store users so we NEVER lose users
        const mergedUsers = [...data.users];
        for (const diskUser of diskData.users) {
          if (!mergedUsers.some(u => u.id === diskUser.id || u.email.toLowerCase() === diskUser.email.toLowerCase())) {
            mergedUsers.push(diskUser);
          }
        }
        const mergedDecisions = [...data.decisions];
        for (const diskDec of diskData.decisions) {
          if (!mergedDecisions.some(d => d.id === diskDec.id)) {
            mergedDecisions.push(diskDec);
          }
        }
        dbCache = { users: mergedUsers, decisions: mergedDecisions };
        saveDatabaseToDisk(dbCache);
        return dbCache;
      }
    }
  } catch (err) {
    // Netlify Blobs unavailable
  }

  // Disk fallback with in-memory merge
  const mergedUsers = [...dbCache.users];
  for (const diskUser of diskData.users) {
    if (!mergedUsers.some(u => u.id === diskUser.id || u.email.toLowerCase() === diskUser.email.toLowerCase())) {
      mergedUsers.push(diskUser);
    }
  }
  const mergedDecisions = [...dbCache.decisions];
  for (const diskDec of diskData.decisions) {
    if (!mergedDecisions.some(d => d.id === diskDec.id)) {
      mergedDecisions.push(diskDec);
    }
  }
  dbCache = { users: mergedUsers, decisions: mergedDecisions };
  return dbCache;
}

/**
 * Persist database to Netlify Blobs and Local Disk
 */
export async function persistDatabaseToStorage(data: DatabaseSchema): Promise<void> {
  dbCache = data;

  // 1. Persist to Netlify Blobs (Production serverless storage)
  try {
    const store = getBlobStore();
    if (store) {
      await store.setJSON('schema', data);
    }
  } catch (err) {
    // Blobs offline in local mode
  }

  // 2. Persist to local disk (Local development / container storage)
  saveDatabaseToDisk(data);
}

// Synchronous wrapper to ensure backward compatibility
function saveDatabase(data: DatabaseSchema): void {
  dbCache = data;
  saveDatabaseToDisk(data);
  // Async fire-and-forget to Netlify Blobs
  try {
    const store = getBlobStore();
    if (store) {
      store.setJSON('schema', data).catch(() => {});
    }
  } catch (e) {}
}

// Initialize Demo Seed Users & Isolated Libraries
export function getOrCreateDemoUser(profile: string = 'user_a'): UserRecord {
  let email = 'demo.workspace1@tiebreaker.app';
  let name = 'Workspace Demo A';
  let id = 'demo_user_a';

  if (profile === 'user_b') {
    email = 'demo.workspace2@tiebreaker.app';
    name = 'Workspace Demo B';
    id = 'demo_user_b';
  } else if (profile === 'guest') {
    email = 'guest.analyst@tiebreaker.app';
    name = 'Guest Analyst';
    id = 'demo_guest';
  }

  let user = dbCache.users.find((u) => u.id === id || u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id,
      email,
      passwordHash: hashPassword('tiebreaker123'),
      name,
      createdAt: new Date().toISOString(),
    };
    dbCache.users.push(user);
    saveDatabase(dbCache);
  }
  return user;
}

export function initializeSeedData(): void {
  const demoUsers = [
    { id: 'demo_user_a', email: 'demo.workspace1@tiebreaker.app', name: 'Workspace Demo A' },
    { id: 'demo_user_b', email: 'demo.workspace2@tiebreaker.app', name: 'Workspace Demo B' },
    { id: 'demo_guest', email: 'guest.analyst@tiebreaker.app', name: 'Guest Analyst' },
  ];

  let modified = false;
  for (const d of demoUsers) {
    if (!dbCache.users.some((u) => u.id === d.id || u.email.toLowerCase() === d.email.toLowerCase())) {
      dbCache.users.push({
        id: d.id,
        email: d.email,
        passwordHash: hashPassword('tiebreaker123'),
        name: d.name,
        createdAt: new Date().toISOString(),
      });
      modified = true;
    }
  }

  if (modified) {
    saveDatabase(dbCache);
  }
}

// Run initial seed check on load
initializeSeedData();

// Password hashing utility using Node.js native crypto
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
  } catch (err) {
    return false;
  }
}

// Simple signed token mechanism
const JWT_SECRET = process.env.JWT_SECRET || 'tiebreaker-secure-session-secret-key-2026';

export function createSessionToken(user: { id: string; email: string; name: string }): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadStr).digest('base64url');
  return `${payloadStr}.${signature}`;
}

export function verifySessionToken(token: string): { id: string; email: string; name: string } | null {
  try {
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payloadStr).digest('base64url');
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    return { id: payload.id, email: payload.email, name: payload.name };
  } catch (err) {
    return null;
  }
}

// User Operations
export function findUserByEmail(email: string): UserRecord | undefined {
  const normalized = email.trim().toLowerCase();
  return dbCache.users.find((u) => u.email.toLowerCase() === normalized);
}

export function findUserById(id: string): UserRecord | undefined {
  return dbCache.users.find((u) => u.id === id);
}

export function createUser(email: string, password: string, name: string): UserRecord {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('User with this email already exists.');
  }

  const newUser: UserRecord = {
    id: 'usr_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    name: name.trim() || normalizedEmail.split('@')[0],
    createdAt: new Date().toISOString(),
  };

  dbCache.users.push(newUser);
  saveDatabase(dbCache);
  return newUser;
}

export function updateUserProfile(
  userId: string,
  updates: { name?: string; bio?: string; avatar?: string; email?: string }
): UserRecord {
  const user = findUserById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  if (updates.name !== undefined && updates.name.trim().length > 0) {
    user.name = updates.name.trim();
  }

  if (updates.bio !== undefined) {
    user.bio = updates.bio.trim();
  }

  if (updates.avatar !== undefined) {
    user.avatar = updates.avatar;
  }

  if (updates.email !== undefined && updates.email.trim().length > 0) {
    const normalized = updates.email.trim().toLowerCase();
    const existing = findUserByEmail(normalized);
    if (existing && existing.id !== userId) {
      throw new Error('This email is already in use by another account.');
    }
    user.email = normalized;
  }

  user.updatedAt = new Date().toISOString();
  saveDatabase(dbCache);
  return user;
}

// Decisions Operations with STRICT User Ownership
export function getDecisionsForUser(userId: string): DecisionAnalysis[] {
  return dbCache.decisions
    .filter((d) => d.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((d) => ({
      ...d.analysis,
      id: d.id, // Ensure consistent id
      title: d.title,
      originalPrompt: d.originalPrompt,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
}

export function getDecisionById(decisionId: string, userId: string): DecisionAnalysis | null {
  const record = dbCache.decisions.find((d) => d.id === decisionId);
  if (!record) return null;
  // STRICT OWNERSHIP CHECK: return null if not owned by this user
  if (record.userId !== userId) {
    return null;
  }
  return {
    ...record.analysis,
    id: record.id,
    title: record.title,
    originalPrompt: record.originalPrompt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function saveDecisionForUser(userId: string, decision: DecisionAnalysis): DecisionAnalysis {
  const now = new Date().toISOString();
  const index = dbCache.decisions.findIndex((d) => d.id === decision.id);

  const decisionPayload: DecisionAnalysis = {
    ...decision,
    updatedAt: now,
  };

  if (index >= 0) {
    // Check ownership before updating
    if (dbCache.decisions[index].userId !== userId) {
      throw new Error('Unauthorized: You cannot modify a decision that does not belong to you.');
    }
    dbCache.decisions[index] = {
      ...dbCache.decisions[index],
      title: decision.title || dbCache.decisions[index].title,
      originalPrompt: decision.originalPrompt || dbCache.decisions[index].originalPrompt,
      analysis: decisionPayload,
      updatedAt: now,
    };
  } else {
    // New decision
    const newRecord: DecisionRecord = {
      id: decision.id,
      userId,
      title: decision.title || 'Untitled Decision',
      originalPrompt: decision.originalPrompt || '',
      analysis: decisionPayload,
      createdAt: decision.createdAt || now,
      updatedAt: now,
    };
    dbCache.decisions.unshift(newRecord);
  }

  saveDatabase(dbCache);
  return decisionPayload;
}

export function deleteDecisionForUser(decisionId: string, userId: string): boolean {
  const index = dbCache.decisions.findIndex((d) => d.id === decisionId);
  if (index === -1) return false;

  // STRICT OWNERSHIP CHECK
  if (dbCache.decisions[index].userId !== userId) {
    throw new Error('Unauthorized: You cannot delete a decision that does not belong to you.');
  }

  dbCache.decisions.splice(index, 1);
  saveDatabase(dbCache);
  return true;
}
