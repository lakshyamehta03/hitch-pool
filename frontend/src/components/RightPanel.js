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
        
        if (activePersonaId) {
            if (p1.id === activePersonaId) {
                title = `${p2.name}`;
                myName = p1.name; otherName = p2.name;
                mySplit = m.splitA?.fraction || 0.5;
                otherSplit = m.splitB?.fraction || 0.5;
            } else {
                title = `${p1.name}`;
                myName = p2.name; otherName = p1.name;
                mySplit = m.splitB?.fraction || 0.5;
                otherSplit = m.splitA?.fraction || 0.5;
            }
        } else {
            // Overview fallback
            title = `${p1.name} × ${p2.name}`;
            myName = p1.name; otherName = p2.name;
            mySplit = m.splitA?.fraction || 0.5;
            otherSplit = m.splitB?.fraction || 0.5;
        }

        const detourMins = Math.abs(Math.round(m.detourSec / 60));

        html += `
            <div class="match-card match-card-instance" data-match-id="${m.id}">
                <h3 style="font-size:1.3rem;">Match with ${title}</h3>
                <p class="intent-loc" style="margin-top:8px;">Detour: ${detourMins} mins extra travel time</p>
                <div class="split-details" style="margin-top:8px; padding:10px; background:rgba(0,0,0,0.3); border-radius:6px;">
                    <p style="margin:0; font-size:1rem; color:#fff;"><b>${myName} pays - </b> <span style="color:var(--accent)">${Math.round(mySplit*100)}%</span></p>
                    <p style="margin:6px 0 0 0; font-size:1rem; color:#fff;"><b>${otherName} pays - </b> <span style="color:var(--accent)">${Math.round(otherSplit*100)}%</span></p>
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
