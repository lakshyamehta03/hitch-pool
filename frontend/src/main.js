import { state, getIntentsForPersona, getMatchesForPersona } from './state.js';
import { API } from './api.js';
import * as mapMod from './map.js';

import { renderPersonaTabs } from './components/PersonaTabs.js';
import { renderOverviewLeft, renderPersonaLeft } from './components/LeftPanel.js';
import { renderIntentForm } from './components/IntentForm.js';
import { renderMatches } from './components/RightPanel.js';

async function bootstrap() {
    mapMod.initMap();
    setupGlobalSearch();
    
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
    setupPanelToggles();
}

function setupGlobalSearch() {
    const input = document.getElementById('map-search-input');
    const resultsBox = document.getElementById('map-search-results');
    const searchContainer = document.getElementById('global-map-search');
    const searchToggle = document.getElementById('global-search-toggle');
    if (!input || !resultsBox || !searchContainer || !searchToggle) return;

    let timeout;
    let activeIndex = -1;
    let isOpen = false;

    function openSearch() {
        isOpen = true;
        searchContainer.style.display = 'flex';
        searchContainer.offsetHeight; // Force reflow
        searchContainer.style.opacity = '1';
        searchContainer.style.transform = 'scale(1)';
        input.focus();
    }

    function closeSearch() {
        isOpen = false;
        searchContainer.style.opacity = '0';
        searchContainer.style.transform = 'scale(0.95)';
        setTimeout(() => { if(!isOpen) searchContainer.style.display = 'none'; }, 200);
        resultsBox.style.display = 'none';
        input.value = '';
    }

    searchToggle.onclick = (e) => {
        e.stopPropagation();
        if(isOpen) closeSearch();
        else openSearch();
    };

    function highlight(items, active) {
        items.forEach((item, i) => {
            if (i === active) { item.style.background = 'var(--glow-soft)'; item.scrollIntoView({block:'nearest'}); }
            else { item.style.background = 'transparent'; }
        });
    }

    input.addEventListener('keydown', (e) => {
        const items = resultsBox.querySelectorAll('.search-item');
        if (e.key === 'ArrowDown') { e.preventDefault(); if (items.length) { activeIndex = (activeIndex + 1) % items.length; highlight(items, activeIndex); } }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (items.length) { activeIndex = (activeIndex - 1 + items.length) % items.length; highlight(items, activeIndex); } }
        else if (e.key === 'Enter') { e.preventDefault(); if (activeIndex > -1 && items[activeIndex]) items[activeIndex].click(); }
        else if (e.key === 'Escape') { closeSearch(); }
    });

    input.addEventListener('input', (e) => {
        const val = e.target.value;
        activeIndex = -1;
        if(val.length < 3) { resultsBox.style.display = 'none'; return; }
        clearTimeout(timeout);
        resultsBox.style.display = 'block';
        resultsBox.innerHTML = '<div style="padding:10px; color:var(--text-muted);"><span class="spinner" style="width:12px;height:12px;vertical-align:middle;margin-right:8px;border-width:2px;display:inline-block;border-top-color:var(--color-primary);border-radius:50%;animation:spin 0.8s linear infinite;"></span> Searching...</div>';
        
        timeout = setTimeout(async () => {
            try {
                const res = await API.searchLocation(val);
                if(!res || res.length === 0) {
                    resultsBox.innerHTML = '<div style="padding:10px;color:#aaa">No results found</div>';
                } else {
                    resultsBox.innerHTML = res.map(r => `<div class="search-item" style="padding:12px 16px; cursor:pointer; font-size: 16px; border-bottom:1px solid var(--stitch-glass-border); transition:background 0.1s; font-family: 'Inter', sans-serif;" data-lat="${r.lat}" data-lon="${r.lon}" data-label="${r.label}">${r.label}</div>`).join('');
                    resultsBox.querySelectorAll('.search-item').forEach(el => {
                        el.onmouseover = () => { 
                            activeIndex = Array.from(resultsBox.children).indexOf(el);
                            highlight(resultsBox.querySelectorAll('.search-item'), activeIndex);
                        };
                        el.onclick = () => {
                            const lat = parseFloat(el.getAttribute('data-lat'));
                            const lon = parseFloat(el.getAttribute('data-lon'));
                            mapMod.flyToLocation(lat, lon);
                            closeSearch();
                        };
                    });
                }
            } catch(e) {
                resultsBox.innerHTML = '<div style="padding:10px;color:#ff4d4d">Error fetching endpoints.</div>';
            }
        }, 1000);
    });

    document.addEventListener('click', (e) => {
        if (isOpen && !searchContainer.contains(e.target) && !searchToggle.contains(e.target)) {
            closeSearch();
        }
    });
}

function setupPanelToggles() {
    const leftPanel = document.getElementById('left-panel');
    const rightPanel = document.getElementById('right-panel');
    const toggleLeft = document.getElementById('toggle-left');
    const toggleRight = document.getElementById('toggle-right');
    
    toggleLeft.onclick = () => {
        leftPanel.classList.toggle('collapsed');
        toggleLeft.textContent = leftPanel.classList.contains('collapsed') ? '▶' : '◀';
        setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
    };
    
    toggleRight.onclick = () => {
        rightPanel.classList.toggle('collapsed');
        toggleRight.textContent = rightPanel.classList.contains('collapsed') ? '◀' : '▶';
        setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
    };
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
