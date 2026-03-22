import crypto from 'crypto';
import Persona from '../models/persona.js';

export class PersonaService {
    getAllPersonas(session) {
        return Array.from(session.personas.values());
    }

    createPersona(session, name) {
        if (!name || name.trim() === '') {
            throw new Error('Persona name is required');
        }
        
        if (session.personas.size >= 10) {
            throw new Error('Maximum 10 personas allowed per playground');
        }
        
        const id = crypto.randomUUID();
        const persona = new Persona(id, name.trim());
        
        session.personas.set(id, persona);
        return persona;
    }

    deletePersona(session, personaId, intentService) {
        if (!session.personas.has(personaId)) throw new Error('Persona not found');
        
        // Find and delete all intents belonging to this persona
        const personaIntents = Array.from(session.intents.values()).filter(i => i.personaId === personaId);
        for (const intent of personaIntents) {
            intentService.deleteIntent(session, intent.id);
        }
        
        session.personas.delete(personaId);
        return true;
    }
}

export default new PersonaService();
