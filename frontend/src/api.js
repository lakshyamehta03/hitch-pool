const API_BASE = import.meta.env.VITE_API_BASE || 'https://hitch-pool-playground.onrender.com/api';

function getSessionId() {
    let id = localStorage.getItem('hitchpool_session');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('hitchpool_session', id);
    }
    return id;
}

export function resetSession() {
    localStorage.removeItem('hitchpool_session');
    window.location.reload();
}

/**
 * Standard fetch wrapper that handles session injection and 401 recreation automatically.
 */
async function apiFetch(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'x-session-id': getSessionId(),
        ...(options.headers || {})
    };
    
    let res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    
    if (res.status === 401) {
        // Session expired or missing server side -> reset and retry once
        resetSession();
        return; // Page will reload from resetSession()
    }
    
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP Error ${res.status}`);
    }
    
    return res.json();
}

export const API = {
    // Personas
    getPersonas: () => apiFetch('/persona'),
    createPersona: (name) => apiFetch('/persona', { method: 'POST', body: JSON.stringify({ name }) }),
    deletePersona: (id) => apiFetch(`/persona/${id}`, { method: 'DELETE' }),

    // Intents
    getAllActiveIntents: () => apiFetch('/intent'),
    createIntent: (data) => apiFetch('/intent', { method: 'POST', body: JSON.stringify(data) }),
    deleteIntent: (id) => apiFetch(`/intent/${id}`, { method: 'DELETE' }),
    
    // Matches
    getAllMatches: () => apiFetch('/intent/matches'),
    getMatchesForPersona: (personaId) => apiFetch(`/intent/matches/${personaId}`),

    // External Proxies
    searchLocation: (query) => apiFetch(`/geocode/search?q=${encodeURIComponent(query)}&limit=5&countrycodes=in`),
    reverseGeocode: (lat, lon) => apiFetch(`/geocode/reverse?lat=${lat}&lon=${lon}`),
    async getSharedRoute(waypoints) {
        return apiFetch(`/route/multi?waypoints=${encodeURIComponent(waypoints)}`);
    }
};
