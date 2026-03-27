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
            <div class="custom-select-trigger">
                <span>🕒 <span class="selected-text" style="margin-left:8px;">${selected}</span></span>
                <span class="chevron" style="transition:transform 0.2s;">▼</span>
            </div>
            <div class="custom-select-options glass-dropdown-overlay fade-scale-in" style="display:none; position:absolute; top:100%; left:0; right:0; max-height:220px; overflow-y:auto; z-index:1000; margin-top:6px;">
                ${times.map((t, idx) => `<div class="custom-option" data-idx="${idx}" style="padding:12px 16px; cursor:pointer; font-size:16px; font-family: 'Inter', sans-serif; font-weight:500; color:var(--text-primary); border-bottom:1px solid var(--stitch-glass-border); transition: background 0.1s;">${t}</div>`).join('')}
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
