export function renderTimePicker(containerId, defaultTime, onSelect) {
    const container = document.getElementById(containerId);
    let times = [];
    for(let h=0; h<=23; h++){
       for(let m=0; m<60; m+=15){
           const hh = String(h).padStart(2, '0');
           const mm = String(m).padStart(2, '0');
           times.push(`${hh}:${mm}`);
       }
    }
    
    let selected = defaultTime || times[0];
    let isOpen = false;
    let focusedIndex = times.indexOf(selected);
    if(focusedIndex === -1) focusedIndex = 0;
    
    container.innerHTML = `
        <div class="custom-select-wrapper" style="position:relative; width:100%; outline:none;" tabindex="0">
            <div class="custom-select-trigger" style="padding:12px; border-radius:8px; font-size:1.1rem; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#fff; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:var(--transition-fast);">
                <span>🕒 <span class="selected-text" style="margin-left:8px; font-weight:600;">${selected}</span></span>
                <span class="chevron" style="transition:transform 0.2s;">▼</span>
            </div>
            <div class="custom-select-options fade-scale-in" style="display:none; position:absolute; top:100%; left:0; right:0; max-height:220px; overflow-y:auto; z-index:1000; margin-top:6px; box-shadow:0 12px 40px rgba(0,0,0,0.9); background:linear-gradient(135deg, var(--bg-dark-1), var(--bg-dark-2)); border:1px solid var(--border-soft); border-radius:var(--radius-md);">
                ${times.map((t, idx) => `<div class="custom-option" data-idx="${idx}" style="padding:12px 16px; cursor:pointer; font-size:1.05rem; font-weight:500; color:var(--text-primary); transition: background 0.1s;">${t}</div>`).join('')}
            </div>
        </div>
    `;
    
    const wrapper = container.querySelector('.custom-select-wrapper');
    const trigger = container.querySelector('.custom-select-trigger');
    const optionsPanel = container.querySelector('.custom-select-options');
    const chevron = container.querySelector('.chevron');
    const selectedText = container.querySelector('.selected-text');
    const optionEls = container.querySelectorAll('.custom-option');
    
    function highlight(idx) {
        optionEls.forEach((el, i) => {
            if(i === idx) {
                el.style.background = 'var(--glow-soft)';
                el.style.color = '#fff';
                el.scrollIntoView({block: 'nearest'});
            } else {
                el.style.background = 'transparent';
                el.style.color = 'var(--text-muted)';
            }
        });
    }
    
    function close() {
        isOpen = false;
        optionsPanel.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
        trigger.style.borderColor = 'rgba(255,255,255,0.2)';
        document.removeEventListener('click', outsideClick);
    }
    
    function open() {
        isOpen = true;
        optionsPanel.style.display = 'block';
        chevron.style.transform = 'rotate(180deg)';
        trigger.style.borderColor = 'var(--color-primary)';
        highlight(focusedIndex);
        setTimeout(() => document.addEventListener('click', outsideClick), 10);
    }
    
    function outsideClick(e) {
        if(!wrapper.contains(e.target)) close();
    }
    
    trigger.onclick = () => isOpen ? close() : open();
    
    optionEls.forEach(el => {
        el.onmouseover = () => { focusedIndex = parseInt(el.getAttribute('data-idx')); highlight(focusedIndex); };
        el.onclick = () => {
            selected = times[parseInt(el.getAttribute('data-idx'))];
            selectedText.textContent = selected;
            onSelect(selected);
            close();
        };
    });
    
    wrapper.onkeydown = (e) => {
        if(e.key === 'Enter') {
            e.preventDefault();
            if(isOpen) {
                selected = times[focusedIndex];
                selectedText.textContent = selected;
                onSelect(selected);
                close();
            } else open();
        } else if(e.key === 'Escape') {
            close();
            wrapper.focus();
        } else if(e.key === 'ArrowDown') {
            e.preventDefault();
            if(!isOpen) open();
            else { focusedIndex = (focusedIndex + 1) % times.length; highlight(focusedIndex); }
        } else if(e.key === 'ArrowUp') {
            e.preventDefault();
            if(!isOpen) open();
            else { focusedIndex = (focusedIndex - 1 + times.length) % times.length; highlight(focusedIndex); }
        }
    };
}
