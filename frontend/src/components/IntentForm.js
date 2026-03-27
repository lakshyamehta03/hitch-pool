import { renderTimePicker } from './TimePicker.js';
import { renderDatePicker } from './DatePicker.js';

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

            <div class="form-group" style="position:relative; z-index:40;">
                <label>Date</label>
                <div id="date-picker-root"></div>
            </div>

            <div class="form-group" style="position:relative; z-index:30;">
                <label>Time</label>
                <div id="time-picker-root"></div>
            </div>
            
            <div class="form-group search-widget" style="position:relative; z-index:20;">
                <label>Pickup Location</label>
                <div style="display:flex; gap:10px; align-items:flex-start;">
                    <div class="input-glass-wrapper" style="position:relative; flex:1; display:flex; align-items:center;">
                        <input type="text" id="pickup-search" class="text-input" placeholder="Pickup Address..." autocomplete="off" />
                        <div id="pickup-chip" class="location-chip" style="display:none;">
                            <span id="pickup-chip-text" class="chip-text"></span>
                            <span id="pickup-clear" class="chip-clear" title="Remove Location">✕</span>
                        </div>
                        <div id="pickup-results" class="search-results glass-dropdown-overlay" style="display:none; max-height:180px; overflow-y:auto; position:absolute; z-index:100; width:100%; top:50px;"></div>
                    </div>
                    <button type="button" id="pin-pickup" class="btn-icon-glass" title="Drop Pin on Map">📍</button>
                </div>
            </div>
            
            <div class="form-group search-widget" style="position:relative; z-index:10;">
                <label>Dropoff Location</label>
                <div style="display:flex; gap:10px; align-items:flex-start;">
                    <div class="input-glass-wrapper" style="position:relative; flex:1; display:flex; align-items:center;">
                        <input type="text" id="dropoff-search" class="text-input" placeholder="Dropoff Address..." autocomplete="off" />
                        <div id="dropoff-chip" class="location-chip" style="display:none;">
                            <span id="dropoff-chip-text" class="chip-text"></span>
                            <span id="dropoff-clear" class="chip-clear" title="Remove Location">✕</span>
                        </div>
                        <div id="dropoff-results" class="search-results glass-dropdown-overlay" style="display:none; max-height:180px; overflow-y:auto; position:absolute; z-index:100; width:100%; top:50px;"></div>
                    </div>
                    <button type="button" id="pin-dropoff" class="btn-icon-glass" title="Drop Pin on Map">📍</button>
                </div>
            </div>
            
            <button id="submit-intent" class="btn-premium" style="margin-top:10px;">
                Submit Intent
            </button>

            <button id="cancel-intent" class="tab-btn" style="width:100%; margin-top:8px; font-size:1.1rem; padding:10px;">
                Cancel
            </button>
        </div>
    `;
    
    let formData = { rideDate: todayDate, departureSlot: '06:00', pickupLat:null, pickupLon:null, pickupLabel:'', dropoffLat:null, dropoffLon:null, dropoffLabel:'' };
    let pickupTimeout, dropoffTimeout;

    const setupSearch = (type) => {
        const input = document.getElementById(`${type}-search`);
        const resultsBox = document.getElementById(`${type}-results`);
        const pinBtn = document.getElementById(`pin-${type}`);
        
        const chip = document.getElementById(`${type}-chip`);
        const chipText = document.getElementById(`${type}-chip-text`);
        const chipClear = document.getElementById(`${type}-clear`);

        const showChip = (label) => {
            input.style.display = 'none';
            chip.style.display = 'flex';
            chipText.textContent = label;
        };

        const clearChip = () => {
            formData[`${type}Lat`] = null;
            formData[`${type}Lon`] = null;
            formData[`${type}Label`] = '';
            input.value = '';
            chip.style.display = 'none';
            input.style.display = 'block';
            input.focus();
        };

        chipClear.onclick = clearChip;
        
        pinBtn.onclick = () => {
            callbacks.onStartPin(type, (loc) => {
                formData[`${type}Lat`] = loc.lat; formData[`${type}Lon`] = loc.lon; formData[`${type}Label`] = loc.label;
                showChip(loc.label);
                resultsBox.style.display = 'none';
            });
        };
        
        let activeIndex = -1;

        function highlightSearchItem(items, idx) {
            items.forEach((item, i) => {
                if(i === idx) {
                    item.style.background = 'var(--glow-soft)';
                    item.scrollIntoView({block:'nearest'});
                } else {
                    item.style.background = 'transparent';
                }
            });
        }

        input.addEventListener('keydown', (e) => {
            const items = resultsBox.querySelectorAll('.search-item');
            if(e.key === 'ArrowDown') {
                e.preventDefault();
                if(items.length===0) return;
                activeIndex = (activeIndex + 1) % items.length;
                highlightSearchItem(items, activeIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if(items.length===0) return;
                activeIndex = (activeIndex - 1 + items.length) % items.length;
                highlightSearchItem(items, activeIndex);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if(activeIndex > -1 && items[activeIndex]) items[activeIndex].click();
            } else if (e.key === 'Escape') {
                resultsBox.style.display = 'none';
            }
        });

        input.addEventListener('input', (e) => {
            const val = e.target.value;
            activeIndex = -1;
            if(val.length < 3) { resultsBox.style.display = 'none'; return; }
            clearTimeout(type === 'pickup' ? pickupTimeout : dropoffTimeout);
            resultsBox.style.display = 'block';
            resultsBox.innerHTML = '<div style="padding:10px; color:var(--text-muted);"><span class="spinner" style="width:12px;height:12px;vertical-align:middle;margin-right:8px;border-width:2px;"></span> Searching locations...</div>';
            
            const to = setTimeout(async () => {
                try {
                    console.log(val);
                    const res = await callbacks.onSearch(val);
                    if(!res || res.length === 0) {
                        resultsBox.innerHTML = '<div style="padding:10px;color:#aaa">No results found</div>';
                    } else {
                        resultsBox.innerHTML = res.map(r => `<div class="search-item" style="padding:12px 16px; cursor:pointer; font-size: 16px; border-bottom:1px solid var(--stitch-glass-border); transition:background 0.1s; font-family: 'Inter', sans-serif;" data-lat="${r.lat}" data-lon="${r.lon}" data-label="${r.label}">${r.label}</div>`).join('');
                        resultsBox.querySelectorAll('.search-item').forEach(el => {
                            el.onmouseover = () => { 
                                activeIndex = Array.from(resultsBox.children).indexOf(el);
                                highlightSearchItem(resultsBox.querySelectorAll('.search-item'), activeIndex);
                            };
                            el.onclick = () => {
                                formData[`${type}Lat`] = parseFloat(el.getAttribute('data-lat')); 
                                formData[`${type}Lon`] = parseFloat(el.getAttribute('data-lon')); 
                                formData[`${type}Label`] = el.getAttribute('data-label');
                                showChip(formData[`${type}Label`]);
                                resultsBox.style.display = 'none';
                                input.value = '';
                            };
                        });
                    }
                } catch(e) {
                    resultsBox.innerHTML = '<div style="padding:10px;color:#ff4d4d">Error fetching endpoints.</div>';
                }
            }, 1500);
            if (type === 'pickup') pickupTimeout = to; else dropoffTimeout = to;
        });
    };
    
    setupSearch('pickup');
    setupSearch('dropoff');
    
    renderDatePicker('date-picker-root', todayDate, todayDate, (date) => formData.rideDate = date);
    renderTimePicker('time-picker-root', '06:00', (time) => formData.departureSlot = time);
    
    document.getElementById('cancel-intent').onclick = callbacks.onCancel;
    
    document.getElementById('submit-intent').onclick = async () => {
        if (!formData.pickupLat || !formData.dropoffLat) return alert("Select locations for both pickup and dropoff.");
        
        const payload = {
            personaId,
            rideDate: formData.rideDate,
            departureSlot: formData.departureSlot,
            ...formData
        };
        
        const btn = document.getElementById('submit-intent');
        
        const rect = btn.getBoundingClientRect();
        btn.style.width = rect.width + 'px';
        btn.style.height = rect.height + 'px';
        
        btn.innerHTML = '<span class="spinner-neon"></span> <span>Processing...</span>';
        btn.disabled = true;
        btn.classList.add('loading');
        btn.setAttribute('aria-busy', 'true');
        
        try {
            const minDelay = new Promise(r => setTimeout(r, 1000));
            const submitProcess = new Promise((resolve, reject) => {
                setTimeout(async () => {
                    try { const res = await callbacks.onSubmit(payload); resolve(res); }
                    catch(e) { reject(e); }
                }, 20);
            });
            await Promise.all([minDelay, submitProcess]);
            
            btn.innerHTML = '✓ Success';
            btn.classList.remove('loading');
            btn.style.background = 'rgba(76, 175, 80, 0.2)';
            btn.style.borderColor = 'rgba(76, 175, 80, 0.5)';
            // Give 400ms for user to soak in the completion explicitly avoiding screen flicker seamlessly.
            await new Promise(r => setTimeout(r, 400));
        } catch(err) {
            btn.innerHTML = 'Submit Intent';
            btn.disabled = false;
            btn.classList.remove('loading');
            btn.removeAttribute('aria-busy');
            btn.style.width = '100%';
            btn.style.height = 'auto';
        }
    };
}
