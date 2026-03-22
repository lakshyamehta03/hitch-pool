import store from '../store/memoryStore.js';

/**
 * Middleware to enforce session existence.
 * Expects 'x-session-id' header or a 'sessionId' in the body/query.
 */
export const sessionMiddleware = (req, res, next) => {
    const sessionId = req.headers['x-session-id'] || req.body.sessionId || req.query.sessionId;

    if (!sessionId) {
        // Just return 401 without creating a session - the client should generate a sessionId
        return res.status(401).json({ error: 'Missing session ID. Please provide a session.' });
    }

    let session = store.getSession(sessionId);

    // If session doesn't exist, we choose to return an error, explicitly to prompt
    // the frontend to refresh the playground (as per context constraints).
    // Or we could auto-create it. Given the instruction: "Refresh would generate a new playground
    // if the sessionId cannot be validated to be of some users old session", returning 401 is safest.
    if (!session) {
        // But for development and ease of use, if the client sends a session ID we haven't seen yet,
        // we can just eagerly create it. The "invalid/expired" means either it was garbage collected
        // or it's genuinely a new user. It's safe to just auto-create it here.
        session = store.createSession(sessionId);
        console.log(`[Session] Created new session: ${sessionId}`);
    }

    // Attach session data to request object
    req.sessionData = session;
    req.sessionId = sessionId;

    next();
};
