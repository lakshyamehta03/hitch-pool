export function renderPersonaTabs(containerId, state, callbacks) {
    const container = document.getElementById(containerId);
    let html = '';
    
    state.personas.forEach(p => {
        const activeClass = state.ui.activePersonaId === p.id ? 'active' : '';
        html += `<button class="tab-btn ${activeClass}" style="color:${p.color}; text-shadow: 0 0 10px ${p.color}, 0 2px 4px rgba(0,0,0,0.8);" data-id="${p.id}">${p.name}</button>`;
    });
    
    // Add the Inline Input form explicitly replacing the prompt()
    html += `
        <div id="inline-persona-form" style="display:none; align-items:center; gap:8px;">
            <input type="text" id="new-persona-name" placeholder="John Doe" style="padding:10px 14px; border-radius:8px; font-size:1.2rem; min-width:160px; border:1px solid var(--accent); background:rgba(255,255,255,0.1); color:white;" />
            <button id="save-persona-btn" style="background:var(--accent); color:white; border:none; padding:10px 16px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.2rem;" title="Save">✓</button>
            <button id="cancel-persona-btn" style="background:transparent; color:#ff4d4d; border:1px solid #ff4d4d; padding:10px 16px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.2rem;" title="Cancel">✗</button>
        </div>
    `;
    html += `<button id="add-persona-btn" class="add-tab-btn">+ Add Persona</button>`;
    
    const overviewClass = state.ui.activeView === 'overview' ? 'active' : '';
    html += `<button id="all-view-btn" class="tab-btn ${overviewClass}" style="margin-left:auto;">All View</button>`;
    
    container.innerHTML = html;
    
    // Interaction bindings
    const formContainer = document.getElementById('inline-persona-form');
    const addBtn = document.getElementById('add-persona-btn');
    const input = document.getElementById('new-persona-name');
    
    addBtn.onclick = () => {
        addBtn.style.display = 'none';
        formContainer.style.display = 'flex';
        input.focus();
    };
    
    document.getElementById('cancel-persona-btn').onclick = () => {
        formContainer.style.display = 'none';
        addBtn.style.display = 'block';
    };
    
    const submitForm = async () => {
        const val = input.value.trim();
        const saveBtn = document.getElementById('save-persona-btn');
        if(!val || saveBtn.disabled) return;
        
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-neon" style="width:14px;height:14px;border-width:2px;border-top-color:#fff;"></span>';
        
        try {
            await callbacks.onAddPersona(val);
        } catch(e) {}
        
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '✓';
        }
    };
    document.getElementById('save-persona-btn').onclick = submitForm;
    input.onkeypress = (e) => { if (e.key === 'Enter') submitForm(); };
    
    // Standard tabs
    container.querySelectorAll('button[data-id]').forEach(btn => {
        btn.onclick = () => callbacks.onSwitchPersona(btn.getAttribute('data-id'));
    });
    
    document.getElementById('all-view-btn').onclick = callbacks.onOverview;
}
