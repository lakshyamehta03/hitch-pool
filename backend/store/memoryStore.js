import dotenv from 'dotenv';
dotenv.config();

const sessions = new Map();

const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS) || 4 * 60 * 60 * 1000;
const GC_INTERVAL_MS = Number(process.env.GC_INTERVAL_MS) || 60 * 60 * 1000;

/**
 * Creates and returns a new session.
 */
export function createSession(sessionId) {
    const sessionData = {
        personas: new Map(),
        intents: new Map(),
        matches: new Map(),
        lastAccessed: Date.now()
    };
    sessions.set(sessionId, sessionData);
    return sessionData;
}

/**
 * Gets a session if it exists and updates its last accessed time.
 */
export function getSession(sessionId) {
    const session = sessions.get(sessionId);
    if (session) {
        session.lastAccessed = Date.now();
    }
    return session;
}

/**
 * Checks if a session exists.
 */
export function hasSession(sessionId) {
    return sessions.has(sessionId);
}

/**
 * Deletes a session.
 */
export function deleteSession(sessionId) {
    return sessions.delete(sessionId);
}

// Garbage Collection Job
setInterval(() => {
    const now = Date.now();
    let count = 0;
    for (const [id, session] of sessions.entries()) {
        if (now - session.lastAccessed > SESSION_TTL_MS) {
            sessions.delete(id);
            count++;
        }
    }
    if (count > 0) {
        console.log(`[Garbage Collection] Cleaned up ${count} expired sessions.`);
    }
}, GC_INTERVAL_MS);

export default {
    createSession,
    getSession,
    hasSession,
    deleteSession
};
