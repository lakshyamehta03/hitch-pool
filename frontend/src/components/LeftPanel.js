import { openConfirmModal } from './ConfirmModal.js';

export function renderOverviewLeft(containerId, state) {
    const left = document.getElementById(containerId);
    
    let html = `
        <div class="panel-header">
            <h2>All Personas Overview</h2>
        </div>
        <div class="panel-body">
            <p class="empty-state" style="margin-bottom:12px; padding:12px; text-align:left; background:rgba(0,0,0,0.2); border-radius:8px;">Showing ${state.intents.size} active intents across ${state.personas.size} personas.</p>
    `;
    
    if (state.intents.size > 0) {
        state.intents.forEach(i => {
            const p = state.personas.get(i.personaId);
            if (!p) return;
            html += `
                <div class="intent-card clickable-intent" data-id="${i.id}" style="border-left: 4px solid ${p.color}; cursor:pointer; transition:all 0.2s; position:relative;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                    <h3 style="color:${p.color}; margin-bottom:10px;">${p.name}'s Ride - ${i.rideDate} at ${i.departureSlot}</h3>
                    <p class="intent-loc">P: ${i.pickupLabel || 'Map Pin'}</p>
                    <p class="intent-loc">D: ${i.dropoffLabel || 'Map Pin'}</p>
                </div>
            `;
        });
    }
    
    html += `</div>`;
    left.innerHTML = html;
}

export function renderPersonaLeft(containerId, persona, intents, callbacks) {
    const left = document.getElementById(containerId);
    
    let html = `
        <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center;">
            <h2 style="color:${persona.color}">${persona.name}'s Intents</h2>
            <button id="delete-persona-btn" class="tab-btn" style="color:#ff4d4d; border:1px solid #ff4d4d; padding:6px 12px; font-weight:bold;">Delete</button>
        </div>
        <div class="panel-body">
            <button class="btn-premium" id="add-intent-btn" style="margin-bottom: 24px;">+ Add Ride Intent</button>
            <div style="margin-top: 24px;">
    `;
    
    if (intents.length === 0) {
        html += `<p class="empty-state">No rides yet. Click Add Intent.</p>`;
    } else {
        intents.forEach(i => {
            html += `
                <div class="intent-card clickable-intent" data-id="${i.id}" style="position:relative; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='rgba(157, 78, 221, 0.1)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'; this.style.transform='translateY(0)'">
                    <h3 style="margin-bottom:12px;">${i.rideDate} at ${i.departureSlot}</h3>
                    <p class="intent-loc">P: ${i.pickupLabel || 'Map Pin'}</p>
                    <p class="intent-loc">D: ${i.dropoffLabel || 'Map Pin'}</p>
                    <button class="delete-intent-btn" data-id="${i.id}" style="position:absolute; top:12px; right:12px; background:transparent; border:1px solid #ff4d4d; border-radius:6px; padding:4px 10px; color:#ff4d4d; cursor:pointer; font-weight:bold; font-size:0.95rem; transition:all 0.2s;" title="Delete Ride">Delete</button>
                </div>
            `;
        });
    }
    
    html += `</div></div>`;
    left.innerHTML = html;
    
    const addBtn = document.getElementById('add-intent-btn');
    if (addBtn) addBtn.onclick = callbacks.onAddIntent;
    
    const delPersonaBtn = document.getElementById('delete-persona-btn');
    if (delPersonaBtn) delPersonaBtn.onclick = () => {
        openConfirmModal({
            title: `Delete ${persona.name}?`,
            description: "Selecting Confirm permanently deletes this persona and unmatches their relationships. This action cannot be undone.",
            onConfirm: () => callbacks.onDeletePersona(persona.id)
        });
    };
    
    left.querySelectorAll('.clickable-intent').forEach(card => {
        card.onclick = (e) => {
            if(e.target.closest('.delete-intent-btn')) return;
            if(callbacks.onViewIntent) callbacks.onViewIntent(card.getAttribute('data-id'));
        }
    });
    
    left.querySelectorAll('.delete-intent-btn').forEach(btn => {
        btn.onclick = () => {
            openConfirmModal({
                title: "Delete Ride Intent?",
                description: "This intention and all corresponding matches bound exclusively against it will be destroyed structurally.",
                onConfirm: () => callbacks.onDeleteIntent(btn.getAttribute('data-id'))
            });
        }
    });
}
