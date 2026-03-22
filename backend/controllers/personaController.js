import personaService from '../services/personaService.js';

export const getAllPersonas = (req, res) => {
    try {
        const personas = personaService.getAllPersonas(req.sessionData);
        res.json(personas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createPersona = (req, res) => {
    try {
        const persona = personaService.createPersona(req.sessionData, req.body.name);
        res.status(201).json(persona);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deletePersona = (req, res) => {
    try {
        // We import intentService inside the scope or pass it to Service
        import('../services/intentService.js').then(module => {
            personaService.deletePersona(req.sessionData, req.params.personaId, module.default);
            res.json({ message: 'Deleted persona and intents' });
        });
    } catch(err) {
        res.status(404).json({ error: err.message });
    }
};
