export function renderMatches(containerId, matchList, state, activePersonaId, onViewRoute) {
    const right = document.getElementById(containerId);
    if (!matchList || matchList.length === 0) {
        right.innerHTML = `<p class="empty-state">No matching rides found.</p>`;
        return;
    }
    
    let html = `
        <div class="panel-header">
            <h2>Matching Rides (${matchList.length})</h2>
        </div>
        <div class="panel-body">
    `;
    
    matchList.forEach(m => {
        const iA = state.intents.get(m.intentAId);
        const iB = state.intents.get(m.intentBId);
        if(!iA || !iB) return;
        
        const p1 = state.personas.get(iA.personaId);
        const p2 = state.personas.get(iB.personaId);
        if (!p1 || !p2) return;
        
        let title = '';
        let mySplit = 0, otherSplit = 0;
        let myName = '', otherName = '';
        let myMins = 0, otherMins = 0;
        
        if (activePersonaId) {
            if (p1.id === activePersonaId) {
                title = `${p2.name}`;
                myName = p1.name; otherName = p2.name;
                mySplit = m.splitA?.fraction || 0.5;
                otherSplit = m.splitB?.fraction || 0.5;
                myMins = Math.round((m.splitA?.durationSec || 0) / 60) || 'N/A';
                otherMins = Math.round((m.splitB?.durationSec || 0) / 60) || 'N/A';
            } else {
                title = `${p1.name}`;
                myName = p2.name; otherName = p1.name;
                mySplit = m.splitB?.fraction || 0.5;
                otherSplit = m.splitA?.fraction || 0.5;
                myMins = Math.round((m.splitB?.durationSec || 0) / 60) || 'N/A';
                otherMins = Math.round((m.splitA?.durationSec || 0) / 60) || 'N/A';
            }
        } else {
            // Overview fallback
            title = `${p1.name} × ${p2.name}`;
            myName = p1.name; otherName = p2.name;
            mySplit = m.splitA?.fraction || 0.5;
            otherSplit = m.splitB?.fraction || 0.5;
            myMins = Math.round((m.splitA?.durationSec || 0) / 60) || 'N/A';
            otherMins = Math.round((m.splitB?.durationSec || 0) / 60) || 'N/A';
        }

        const detourMins = Math.abs(Math.round(m.detourSec / 60));

        html += `
            <div class="match-card match-card-instance" data-match-id="${m.id}">
                <h3 style="font-size:1.3rem;">Match with ${title}</h3>
                <p class="intent-loc" style="margin-top:8px;">Detour: ${detourMins} mins extra travel time</p>
                <div class="split-details" style="margin-top:12px; padding:12px; background:rgba(0,0,0,0.3); border-radius:8px; display:flex; flex-direction:column; gap:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <p style="margin:0; font-size:1rem; color:#fff;"><b>${myName}</b> pays <span style="color:var(--color-primary)">${Math.round(mySplit*100)}%</span></p>
                        <span style="color:var(--text-secondary); font-size:0.95rem;">⏱ ${myMins} min</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <p style="margin:0; font-size:1rem; color:#fff;"><b>${otherName}</b> pays <span style="color:var(--color-primary)">${Math.round(otherSplit*100)}%</span></p>
                        <span style="color:var(--text-secondary); font-size:0.95rem;">⏱ ${otherMins} min</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    right.innerHTML = html;

    const cards = right.querySelectorAll('.match-card-instance');
    cards.forEach(card => {
        card.onclick = () => {
            const matchId = card.getAttribute('data-match-id');
            onViewRoute(matchId);
        };
    });
}
