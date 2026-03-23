import { inject } from '@vercel/analytics';

import { state, getIntentsForPersona, getMatchesForPersona } from './state.js';
import { API } from './api.js';
import * as mapMod from './map.js';

import { renderPersonaTabs } from './components/PersonaTabs.js';
import { renderOverviewLeft, renderPersonaLeft } from './components/LeftPanel.js';
import { renderIntentForm } from './components/IntentForm.js';
import { renderMatches } from './components/RightPanel.js';

// Initialize Vercel Web Analytics
inject();

async function bootstrap() {
    mapMod.initMap();
    
    try {
        const personas = await API.getPersonas();
        personas.forEach(p => state.personas.set(p.id, p));
        
        const intents = await API.getAllActiveIntents();
        intents.forEach(i => state.intents.set(i.id, i));
        
        const matches = await API.getAllMatches();
        matches.forEach(m => state.matches.set(m.id, m));
    } catch(err) {
        console.error("Bootstrap error: ", err);
    }
    
    updateTabsUI();
    switchToView('overview');
}

function updateTabsUI() {
    renderPersonaTabs('persona-tabs', state, {
        onSwitchPersona: switchToPersona,
        onOverview: () => switchToView('overview'),
        onAddPersona: handleAddPersona
    });
}

function switchToView(view) {
    state.ui.activeView = view;
    state.ui.activePersonaId = null;
    
    updateTabsUI();
    mapMod.clearAllRoutes();
    mapMod.clearFormPins();
    
    if (view === 'overview') {
        renderOverviewLeft('left-panel-content', state);
        updateMatchesUI(Array.from(state.matches.values()));
        
        state.intents.forEach(intent => {
            const p = state.personas.get(intent.personaId);
            if (p) mapMod.drawSoloRoute(intent, p.color);
        });
    }
}

function switchToPersona(personaId) {
    state.ui.activeView = 'persona';
    state.ui.activePersonaId = personaId;
    
    updateTabsUI();
    mapMod.clearAllRoutes();
    mapMod.clearFormPins();
    
    const persona = state.personas.get(personaId);
    if (!persona) return;
    const intents = getIntentsForPersona(personaId);
    
    renderPersonaLeft('left-panel-content', persona, intents, {
        onAddIntent: () => showIntentForm(personaId),
        onViewIntent: (iId) => {
            mapMod.clearAllRoutes();
            const i = state.intents.get(iId);
            if(i) mapMod.drawSoloRoute(i, persona.color);
        },
        onDeleteIntent: async (iId) => {
            try {
                await API.deleteIntent(iId);
                state.intents.delete(iId);
                // Also remove matches referencing this intent
                for(const [mId, m] of state.matches.entries()) {
                    if(m.intentAId === iId || m.intentBId === iId) state.matches.delete(mId);
                }
                switchToPersona(personaId);
            } catch(e) { alert(e.message); }
        },
        onDeletePersona: async (pId) => {
            try {
                await API.deletePersona(pId);
                state.personas.delete(pId);
                const toDel = Array.from(state.intents.values()).filter(i => i.personaId === pId);
                toDel.forEach(i => state.intents.delete(i.id));
                for(const [mId, m] of state.matches.entries()) {
                    if(toDel.find(td => td.id === m.intentAId || td.id === m.intentBId)) state.matches.delete(mId);
                }
                switchToView('overview');
            } catch(e) { alert(e.message); }
        }
    });
    
    updateMatchesUI(getMatchesForPersona(personaId));
    
    intents.forEach(intent => {
        mapMod.drawSoloRoute(intent, persona.color);
    });
}

function showIntentForm(personaId) {
    renderIntentForm('left-panel-content', personaId, {
        onSearch: API.searchLocation.bind(API),
        onStartPin: mapMod.startPinPlacement,
        onCancel: () => switchToPersona(personaId),
        onSubmit: async (payload) => {
            try {
                const res = await API.createIntent(payload);
                state.intents.set(res.intent.id, res.intent);
                res.matches.forEach(m => state.matches.set(m.id, m));
                switchToPersona(personaId);
            } catch(e) {
                alert(e.message);
                throw e;
            }
        }
    });
}

function updateMatchesUI(matchList) {
    renderMatches('right-panel-content', matchList, state, state.ui.activePersonaId, handleViewSharedRoute);
}

async function handleViewSharedRoute(matchId) {
    const match = state.matches.get(matchId);
    if (!match) return;
    
    const iA = state.intents.get(match.intentAId);
    const iB = state.intents.get(match.intentBId);
    if (!iA || !iB) return;
    
    const seq = [
        [iA.pickupLon, iA.pickupLat], [iB.pickupLon, iB.pickupLat], 
        [iA.dropoffLon, iA.dropoffLat], [iB.dropoffLon, iB.dropoffLat]
    ];
    
    let path = [];
    if (match.bestSequence === 1) path = [0, 1, 2, 3];
    else if (match.bestSequence === 2) path = [0, 1, 3, 2];
    else if (match.bestSequence === 3) path = [1, 0, 2, 3];
    else if (match.bestSequence === 4) path = [1, 0, 3, 2];
    
    const waypointsArray = path.map(idx => ({ lat: seq[idx][1], lon: seq[idx][0] }));
    const waypointsStr = path.map(idx => `${seq[idx][0]},${seq[idx][1]}`).join(';');
    
    if (!match.sharedGeometry) {
        try {
            const res = await API.getSharedRoute(waypointsStr);
            match.sharedGeometry = res.geometry;
        } catch(err) {
            console.error(err);
            return;
        }
    }
    
    mapMod.drawSharedRoute(match.sharedGeometry, waypointsArray);
}

async function handleAddPersona(name) {
    if (!name || name.trim() === '') return;
    try {
        const p = await API.createPersona(name.trim());
        state.personas.set(p.id, p);
        switchToPersona(p.id);
    } catch (e) {
        alert(e.message);
    }
}

window.onload = bootstrap;
