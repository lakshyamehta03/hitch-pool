export const state = {
    personas: new Map(),
    intents: new Map(), 
    matches: new Map(),
    
    ui: {
        activePersonaId: null,
        activeView: 'overview', // 'overview' | 'persona'
        selectedMatchId: null,
        mapMode: 'idle' // 'idle' | 'pickup' | 'dropoff'
    }
};

export function getIntentsForPersona(personaId) {
    if (!personaId) return [];
    return Array.from(state.intents.values())
        .filter(i => i.personaId === personaId && i.status === 'active');
}

export function getMatchesForPersona(personaId) {
    if (!personaId) return [];
    const intentIds = new Set(getIntentsForPersona(personaId).map(i => i.id));
    return Array.from(state.matches.values()).filter(m =>
        intentIds.has(m.intentAId) || intentIds.has(m.intentBId)
    );
}
