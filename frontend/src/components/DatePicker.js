export function renderDatePicker(containerId, defaultDateStr, minDateStr, onSelect) {
    const container = document.getElementById(containerId);
    let selectedDate = new Date(defaultDateStr + 'T12:00:00Z');
    let viewDate = new Date(selectedDate);
    let isOpen = false;

    if(!document.getElementById('dp-style')) {
        const style = document.createElement('style');
        style.id = 'dp-style';
        style.textContent = `.dp-day-hover:hover { background: var(--glow-soft) !important; color: #fff !important; transform: scale(1.1); box-shadow: 0 4px 10px rgba(124,58,237,0.3); }`;
        document.head.appendChild(style);
    }

    container.innerHTML = `
        <div class="custom-select-wrapper datepicker-wrapper" style="position:relative; width:100%; outline:none;" tabindex="0">
            <div class="custom-select-trigger">
                <span>📅 <span class="selected-text" style="margin-left:8px;">${defaultDateStr}</span></span>
            </div>
            <div class="custom-select-options glass-dropdown-overlay fade-scale-in" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:1000; margin-top:6px; padding:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <button class="dp-prev" style="background:transparent; border:none; color:var(--text-primary); cursor:pointer; padding:4px 8px; font-weight:bold; font-size:1.2rem; transition:transform 0.1s;">&lt;</button>
                    <div class="dp-month-year" style="font-weight:600; font-size:1.1rem; color:var(--text-primary); font-family: 'Inter', sans-serif;"></div>
                    <button class="dp-next" style="background:transparent; border:none; color:var(--text-primary); cursor:pointer; padding:4px 8px; font-weight:bold; font-size:1.2rem; transition:transform 0.1s;">&gt;</button>
                </div>
                <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:4px; text-align:center; color:var(--text-secondary); font-size:0.85rem; margin-bottom:8px; font-weight:600;">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                </div>
                <div class="dp-grid" style="display:grid; grid-template-columns:repeat(7, 1fr); gap:4px; text-align:center; outline:none;" tabindex="-1">
                </div>
            </div>
        </div>
    `;

    const wrapper = container.querySelector('.datepicker-wrapper');
    const trigger = container.querySelector('.custom-select-trigger');
    const panel = container.querySelector('.custom-select-options');
    const selectedText = container.querySelector('.selected-text');
    const monthYear = container.querySelector('.dp-month-year');
    const grid = container.querySelector('.dp-grid');

    const dpPrev = container.querySelector('.dp-prev');
    const dpNext = container.querySelector('.dp-next');

    function renderCalendar() {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        monthYear.textContent = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        let html = '';
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        const selectedStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`;
        
        for(let i = firstDay - 1; i >= 0; i--) {
            html += `<div style="padding:8px; color:rgba(255,255,255,0.15); font-size:0.95rem;">${daysInPrevMonth - i}</div>`;
        }
        
        for(let d = 1; d <= daysInMonth; d++) {
            const thisDateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const isSelected = thisDateStr === selectedStr;
            const isToday = thisDateStr === todayStr;
            const isPast = minDateStr && thisDateStr < minDateStr;
            
            let bg = isSelected ? 'linear-gradient(135deg, var(--color-primary), #ff4757)' : 'transparent';
            let color = isPast ? 'rgba(255,255,255,0.2)' : (isSelected ? '#fff' : 'var(--text-primary)');
            let cursor = isPast ? 'not-allowed' : 'pointer';
            let outline = isToday && !isSelected ? '1px solid var(--border-soft)' : 'none';
            let hoverClass = !isPast && !isSelected ? 'dp-day-hover' : '';
            
            html += `<div class="dp-day ${hoverClass}" data-date="${thisDateStr}" style="padding:8px; border-radius:8px; background:${bg}; color:${color}; cursor:${cursor}; font-size:0.95rem; font-weight:500; outline:${outline}; transition:all var(--transition-fast);">${d}</div>`;
        }
        
        const totalCells = firstDay + daysInMonth;
        const remaining = (7 - (totalCells % 7)) % 7;
        for(let i = 1; i <= remaining; i++) {
            html += `<div style="padding:8px; color:rgba(255,255,255,0.15); font-size:0.95rem;">${i}</div>`;
        }
        
        grid.innerHTML = html;
        
        grid.querySelectorAll('.dp-day').forEach(el => {
            if(el.style.cursor === 'pointer') {
                el.onclick = (e) => {
                    e.stopPropagation();
                    const dStr = el.getAttribute('data-date');
                    selectedDate = new Date(dStr + 'T12:00:00Z');
                    selectedText.textContent = dStr;
                    onSelect(dStr);
                    close();
                };
            }
        });
    }

    dpPrev.onclick = (e) => { e.stopPropagation(); viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); };
    dpNext.onclick = (e) => { e.stopPropagation(); viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); };

    function close() {
        isOpen = false;
        panel.style.display = 'none';
        trigger.style.borderColor = 'rgba(255,255,255,0.2)';
        document.removeEventListener('click', outsideClick);
    }
    
    function open() {
        isOpen = true;
        viewDate = new Date(selectedDate);
        renderCalendar();
        panel.style.display = 'block';
        trigger.style.borderColor = 'var(--color-primary)';
        setTimeout(() => document.addEventListener('click', outsideClick), 10);
    }
    
    function outsideClick(e) {
        if(!wrapper.contains(e.target)) close();
    }
    
    trigger.onclick = () => isOpen ? close() : open();
    
    wrapper.onkeydown = (e) => {
        if(e.key === 'Escape') {
            close();
            wrapper.focus();
        } else if(e.key === 'Enter') {
            if(!isOpen) open();
        }
    };
}
