import crypto from 'crypto';
import Intent from '../models/intent.js';
import { enrichIntent } from './enrichmentService.js';
import { findMatches } from './matchingService.js';

export class IntentService {
    getAllActiveIntents(session) {
        return Array.from(session.intents.values()).filter(i => i.status === 'active');
    }

    getAllMatches(session) {
        return Array.from(session.matches.values());
    }

    getMatchesForPersona(session, personaId) {
        const personaIntentIds = new Set(
            Array.from(session.intents.values())
                .filter(i => i.personaId === personaId)
                .map(i => i.id)
        );
        
        return Array.from(session.matches.values()).filter(m => 
            personaIntentIds.has(m.intentAId) || personaIntentIds.has(m.intentBId)
        );
    }

    async createIntent(session, data) {
        if (!data.personaId) {
            throw new Error('personaId is required');
        }
        
        if (!session.personas.has(data.personaId)) {
            throw new Error('Persona not found');
        }
        
        const personaIntents = Array.from(session.intents.values())
            .filter(i => i.personaId === data.personaId && i.status === 'active');
            
        if (personaIntents.length >= 10) {
            throw new Error('Maximum 10 intents allowed per persona');
        }
        
        const duplicate = personaIntents.find(i => 
            i.rideDate === data.rideDate && i.departureSlot === data.departureSlot
        );
        
        if (duplicate) {
            throw new Error('You already have a ride at this time. Please choose a different time slot.');
        }
        
        const id = crypto.randomUUID();
        const intent = new Intent(id, data.personaId, data);
        
        await enrichIntent(intent);
        intent.status = 'active';
        session.intents.set(id, intent);
        
        const allActiveIntents = Array.from(session.intents.values()).filter(i => i.status === 'active');
        const newMatches = await findMatches(intent, allActiveIntents);
        newMatches.forEach(m => session.matches.set(m.id, m));
        
        return { intent, matches: newMatches };
    }

    deleteIntent(session, intentId) {
        if (!session.intents.has(intentId)) {
            throw new Error('Intent not found');
        }
        
        session.intents.delete(intentId);
        
        for (const [matchId, match] of session.matches.entries()) {
            if (match.intentAId === intentId || match.intentBId === intentId) {
                session.matches.delete(matchId);
            }
        }
        
        return true;
    }
}

export default new IntentService();
