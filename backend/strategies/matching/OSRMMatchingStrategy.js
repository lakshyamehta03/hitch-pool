import MatchingStrategy from './MatchingStrategy.js';
import Match from '../../models/match.js';
import { getDetailedRoute } from '../../services/enrichmentService.js';
import { config } from '../../config/env.js';

class OSRMMatchingStrategy extends MatchingStrategy {
    constructor(costStrategy) {
        super();
        this.costStrategy = costStrategy;
    }

    async evaluateMatch(newIntent, c) {
        const A = { lat: newIntent.pickupLat, lon: newIntent.pickupLon };
        const B = { lat: newIntent.dropoffLat, lon: newIntent.dropoffLon };
        const C = { lat: c.pickupLat, lon: c.pickupLon };
        const D = { lat: c.dropoffLat, lon: c.dropoffLon };
        
        const seqs = [[A, C, B, D], [A, C, D, B], [C, A, B, D], [C, A, D, B]];
        
        try {
            const promises = seqs.map(waypoints => getDetailedRoute(waypoints));
            const results = await Promise.all([...promises].map(p => p.catch(e => null)));
            
            let bestT2 = Infinity;
            let bestSeqIdx = -1;
            
            for (let i = 0; i < results.length; i++) {
                if (results[i]) {
                    console.log(`[OSRM Math] Evaluated Sequence ${i + 1} | Total Shared Duration: Math.round(${results[i].durationSec / 60}) mins | Segments: ${results[i].legs.map(l => Math.round(l.durationSec/60) + 'm').join(', ')}`);
                }
                if (results[i] && results[i].durationSec < bestT2) {
                    bestT2 = results[i].durationSec;
                    bestSeqIdx = i + 1;
                }
            }
            if (bestSeqIdx !== -1) {
                console.log(`[OSRM Math] Best Sequence Selected: #${bestSeqIdx} (${Math.round(bestT2/60)} mins)`);
                const bestResult = results[bestSeqIdx - 1]; // contains legs data
                
                let durationA = 0;
                let durationB = 0;
                
                if (bestSeqIdx === 1) { // A C B D
                    durationA = bestResult.legs[0].durationSec + bestResult.legs[1].durationSec;
                    durationB = bestResult.legs[1].durationSec + bestResult.legs[2].durationSec;
                } else if (bestSeqIdx === 2) { // A C D B
                    durationA = bestResult.legs[0].durationSec + bestResult.legs[1].durationSec + bestResult.legs[2].durationSec;
                    durationB = bestResult.legs[1].durationSec;
                } else if (bestSeqIdx === 3) { // C A B D
                    durationA = bestResult.legs[1].durationSec;
                    durationB = bestResult.legs[0].durationSec + bestResult.legs[1].durationSec + bestResult.legs[2].durationSec;
                } else if (bestSeqIdx === 4) { // C A D B
                    durationA = bestResult.legs[1].durationSec + bestResult.legs[2].durationSec;
                    durationB = bestResult.legs[0].durationSec + bestResult.legs[1].durationSec;
                }

                const T1 = newIntent.soloDurationSec + c.soloDurationSec;
                const detour = bestT2 - T1;
                const minSolo = Math.min(newIntent.soloDurationSec, c.soloDurationSec);
                const detourRatio = detour / minSolo;
                
                if (detour <= config.MAX_DETOUR_SEC && detourRatio <= config.MAX_DETOUR_RATIO) {
                    const isNewIntentA = newIntent.id < c.id;
                    const matchId = isNewIntentA ? `${newIntent.id}::${c.id}` : `${c.id}::${newIntent.id}`;
                    
                    const match = new Match(
                        matchId,
                        isNewIntentA ? newIntent.id : c.id,          // intentAId
                        isNewIntentA ? c.id : newIntent.id,          // intentBId
                        {
                            detourSec: detour,
                            detourRatio: detourRatio,
                            sharedDurationSec: bestT2,
                            bestSequence: bestSeqIdx
                        }
                    );
                    
                    const { splitA, splitB } = this.costStrategy.calculateSplit(durationA, durationB);
                    if (isNewIntentA) {
                        match.splitA = { fraction: splitA, durationSec: durationA };
                        match.splitB = { fraction: splitB, durationSec: durationB };
                    } else {
                        match.splitA = { fraction: splitB, durationSec: durationB };
                        match.splitB = { fraction: splitA, durationSec: durationA };
                    }
                    return match;
                }
            }
        } catch(err) {
            console.warn(`Evaluation failed:` + err.message);
        }
        return null;
    }
}

export default OSRMMatchingStrategy;
