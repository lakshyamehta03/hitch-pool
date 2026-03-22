export function renderIntentForm(containerId, personaId, callbacks) {
    const left = document.getElementById(containerId);
    const todayDate = new Date().toISOString().split('T')[0];
    
    let timeOptions = '';
    for(let h=6; h<=23; h++){
       for(let m=0; m<60; m+=15){
           const hh = String(h).padStart(2, '0');
           const mm = String(m).padStart(2, '0');
           timeOptions += `<option value="${hh}:${mm}">${hh}:${mm}</option>`;
       }
    }

    left.innerHTML = `
        <div class="panel-header">
            <h2 style="font-size:1.6rem; margin-bottom:10px;">Add Ride Intent</h2>
        </div>
        <div class="panel-body" style="display:flex; flex-direction:column; gap:20px;">

            <div class="form-group">
                <label style="color:var(--accent); font-size:18px; margin-bottom:6px; display:block;">Date</label>
                <input 
                    type="date" 
                    id="form-date" 
                    min="${todayDate}" 
                    value="${todayDate}" 
                    class="text-input" 
                    style="
                        width:100%; 
                        padding:12px; 
                        border-radius:8px; 
                        font-size:1.2rem; 
                        color:#fff; 
                        background:rgba(255,255,255,0.08); 
                        border:1px solid #555;
                    "
                />
            </div>

            <div class="form-group">
                <label style="color:var(--accent); font-size:18px; margin-bottom:6px; display:block;">Time</label>
                <select 
                    id="form-time" 
                    class="text-input" 
                    style="
                        width:100%; 
                        padding:12px; 
                        border-radius:8px; 
                        font-size:1.2rem; 
                        color:#000; 
                        background:#e0e0e0; 
                        border:1px solid #555;
                    "
                >
                    ${timeOptions}
                </select>
            </div>
            
            <div class="form-group search-widget" style="position:relative;">
                <label style="color:var(--accent); font-size:20px; margin-bottom:6px; display:block;">Pickup Location</label>
                <div style="display:flex; gap:10px;">
                    <input 
                        type="text" 
                        id="pickup-search" 
                        class="text-input" 
                        placeholder="Search address..." 
                        autocomplete="off" 
                        style="
                            flex:1; 
                            padding:12px; 
                            border-radius:8px; 
                            font-size:1.1rem; 
                            color:#fff; 
                            background:rgba(255,255,255,0.08); 
                            border:1px solid #555;
                        " 
                    />
                    <button type="button" id="pin-pickup" class="tab-btn" style="padding:0 16px; font-size:1.4rem;">📍</button>
                </div>
                <div id="pickup-results" class="search-results" style="display:none; background:#1e1e24; border:1px solid var(--accent); max-height:150px; overflow-y:auto; position:absolute; z-index:100; width:100%; top:80px; border-radius:8px;"></div>
                <div id="pickup-label" style="font-size:1.05rem; margin-top:8px; color:var(--accent); font-weight:bold;"></div>
            </div>
            
            <div class="form-group search-widget" style="position:relative;">
                <label style="color:var(--accent); font-size:20px; margin-bottom:6px; display:block;">Dropoff Location</label>
                <div style="display:flex; gap:10px;">
                    <input 
                        type="text" 
                        id="dropoff-search" 
                        class="text-input" 
                        placeholder="Search address..." 
                        autocomplete="off" 
                        style="
                            flex:1; 
                            padding:12px; 
                            border-radius:8px; 
                            font-size:1.1rem; 
                            color:#fff; 
                            background:rgba(255,255,255,0.08); 
                            border:1px solid #555;
                        " 
                    />
                    <button type="button" id="pin-dropoff" class="tab-btn" style="padding:0 16px; font-size:1.4rem;">📍</button>
                </div>
                <div id="dropoff-results" class="search-results" style="display:none; background:#1e1e24; border:1px solid var(--accent); max-height:150px; overflow-y:auto; position:absolute; z-index:100; width:100%; top:80px; border-radius:8px;"></div>
                <div id="dropoff-label" style="font-size:1.05rem; margin-top:8px; color:var(--accent); font-weight:bold;"></div>
            </div>
            
            <button id="submit-intent" class="btn-primary" style="font-size:1.2rem; padding:12px; margin-top:10px;">
                Submit Intent
            </button>

            <button id="cancel-intent" class="tab-btn" style="width:100%; margin-top:8px; font-size:1.1rem; padding:10px;">
                Cancel
            </button>
        </div>
    `;
    
    let formData = { pickupLat:null, pickupLon:null, pickupLabel:'', dropoffLat:null, dropoffLon:null, dropoffLabel:'' };
    let pickupTimeout, dropoffTimeout;

    const setupSearch = (type) => {
        const input = document.getElementById(`${type}-search`);
        const resultsBox = document.getElementById(`${type}-results`);
        const labelBox = document.getElementById(`${type}-label`);
        const pinBtn = document.getElementById(`pin-${type}`);
        
        pinBtn.onclick = () => {
            callbacks.onStartPin(type, (loc) => {
                formData[`${type}Lat`] = loc.lat; formData[`${type}Lon`] = loc.lon; formData[`${type}Label`] = loc.label;
                labelBox.textContent = '✓ Map Pin: ' + loc.label;
                input.value = '';
            });
        };
        
        input.addEventListener('input', (e) => {
            const val = e.target.value;
            if(val.length < 3) { resultsBox.style.display = 'none'; return; }
            clearTimeout(type === 'pickup' ? pickupTimeout : dropoffTimeout);
            const to = setTimeout(async () => {
                try {
                    const res = await callbacks.onSearch(val);
                    if(!res || res.length === 0) {
                        resultsBox.innerHTML = '<div style="padding:10px;color:#aaa">No results</div>';
                    } else {
                        resultsBox.innerHTML = res.map(r => `<div class="search-item" style="padding:10px; cursor:pointer; border-bottom:1px solid #333;" data-lat="${r.lat}" data-lon="${r.lon}" data-label="${r.label}">${r.label}</div>`).join('');
                        resultsBox.querySelectorAll('.search-item').forEach(el => {
                            el.onmouseover = () => el.style.background = 'rgba(157, 78, 221, 0.2)';
                            el.onmouseout = () => el.style.background = 'transparent';
                            el.onclick = () => {
                                formData[`${type}Lat`] = parseFloat(el.getAttribute('data-lat')); 
                                formData[`${type}Lon`] = parseFloat(el.getAttribute('data-lon')); 
                                formData[`${type}Label`] = el.getAttribute('data-label');
                                labelBox.textContent = '✓ ' + formData[`${type}Label`];
                                resultsBox.style.display = 'none';
                                input.value = formData[`${type}Label`];
                            };
                        });
                    }
                    resultsBox.style.display = 'block';
                } catch(e) {}
            }, 500);
            if (type === 'pickup') pickupTimeout = to; else dropoffTimeout = to;
        });
    };
    
    setupSearch('pickup');
    setupSearch('dropoff');
    
    document.getElementById('cancel-intent').onclick = callbacks.onCancel;
    
    document.getElementById('submit-intent').onclick = async () => {
        if (!formData.pickupLat || !formData.dropoffLat) return alert("Select locations for both pickup and dropoff.");
        
        const payload = {
            personaId,
            rideDate: document.getElementById('form-date').value,
            departureSlot: document.getElementById('form-time').value,
            ...formData
        };
        
        const btn = document.getElementById('submit-intent');
        btn.textContent = 'Processing...';
        btn.disabled = true;
        
        try {
            await callbacks.onSubmit(payload);
        } catch(err) {
            btn.textContent = 'Submit Intent';
            btn.disabled = false;
        }
    };
}
