export function openConfirmModal({ title, description, onConfirm, onCancel }) {
    // Prevent duplicated modals
    const existing = document.getElementById('hitchpool-confirm-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'hitchpool-confirm-modal';
    overlay.className = 'glass fade-scale-in';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        display: flex; align-items: center; justify-content: center;
        z-index: 9999; background: rgba(0,0,0,0.6);
        border-radius: 0; backdrop-filter: blur(4px);
    `;

    const modal = document.createElement('div');
    modal.className = 'glass';
    modal.style.cssText = `
        width: 100%; max-width: 400px; padding: 24px;
        display: flex; flex-direction: column; gap: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.8);
        border: 1px solid var(--border-soft);
        background: linear-gradient(145deg, var(--bg-dark-1), var(--bg-dark-2));
    `;

    // Top Glowing Icon
    const iconWrapper = document.createElement('div');
    iconWrapper.style.cssText = `
        width: 48px; height: 48px; border-radius: 50%;
        background: rgba(255, 77, 77, 0.1); display: flex;
        align-items: center; justify-content: center;
        margin: 0 auto; box-shadow: 0 0 20px rgba(255, 77, 77, 0.4);
        color: #ff4d4d; font-size: 24px; font-weight: bold;
    `;
    iconWrapper.innerHTML = '!';

    const header = document.createElement('h3');
    header.style.cssText = 'margin: 0; text-align: center; font-size: 1.5rem; font-weight: 700; color: white;';
    header.textContent = title;

    const desc = document.createElement('p');
    desc.style.cssText = 'margin: 0; text-align: center; color: var(--text-muted); font-size: 1.1rem; line-height: 1.5;';
    desc.textContent = description;

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display: flex; gap: 12px; margin-top: 8px; width: 100%;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = `
        flex: 1; padding: 12px; border-radius: var(--radius-md);
        background: transparent; color: white; border: 1px solid var(--border-soft);
        font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all var(--transition-fast);
    `;
    cancelBtn.onmouseover = () => cancelBtn.style.background = 'rgba(255,255,255,0.05)';
    cancelBtn.onmouseout = () => cancelBtn.style.background = 'transparent';

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Confirm';
    confirmBtn.style.cssText = `
        flex: 1; padding: 12px; border-radius: var(--radius-md);
        background: linear-gradient(90deg, #ff4757, #ff6b81);
        color: white; border: none; font-size: 1.1rem; font-weight: 600;
        cursor: pointer; transition: all var(--transition-fast);
        box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
    `;
    confirmBtn.onmouseover = () => { confirmBtn.style.boxShadow = '0 6px 20px rgba(255, 71, 87, 0.6)'; confirmBtn.style.transform = 'translateY(-2px)'; };
    confirmBtn.onmouseout = () => { confirmBtn.style.boxShadow = '0 4px 15px rgba(255, 71, 87, 0.4)'; confirmBtn.style.transform = 'none'; };

    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(confirmBtn);
    
    modal.appendChild(iconWrapper);
    modal.appendChild(header);
    modal.appendChild(desc);
    modal.appendChild(btnContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Animation trigger
    requestAnimationFrame(() => overlay.classList.add('active'));

    const cleanup = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 200);
        document.removeEventListener('keydown', keypressHandler);
    };

    const keypressHandler = (e) => {
        if (e.key === 'Escape') { cleanup(); if(onCancel) onCancel(); }
        if (e.key === 'Enter') { cleanup(); if(onConfirm) onConfirm(); }
    };

    document.addEventListener('keydown', keypressHandler);

    cancelBtn.onclick = () => { cleanup(); if(onCancel) onCancel(); };
    confirmBtn.onclick = () => { cleanup(); if(onConfirm) onConfirm(); };
}
