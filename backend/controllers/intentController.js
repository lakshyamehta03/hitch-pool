import intentService from '../services/intentService.js';

export const getAllActiveIntents = (req, res) => {
    try {
        res.json(intentService.getAllActiveIntents(req.sessionData));
    } catch(err) { 
        res.status(500).json({ error: err.message }); 
    }
};

export const getMatchesForPersona = (req, res) => {
    try {
        res.json(intentService.getMatchesForPersona(req.sessionData, req.params.personaId));
    } catch(err) { 
        res.status(500).json({ error: err.message }); 
    }
};

export const getAllMatches = (req, res) => {
    try {
        res.json(intentService.getAllMatches(req.sessionData));
    } catch(err) { 
        res.status(500).json({ error: err.message }); 
    }
};

export const createIntent = async (req, res) => {
    try {
        const result = await intentService.createIntent(req.sessionData, req.body);
        res.status(201).json(result);
    } catch(err) { 
        // We broadly catch validation errors to 400
        res.status(400).json({ error: err.message }); 
    }
};

export const deleteIntent = (req, res) => {
    try {
        intentService.deleteIntent(req.sessionData, req.params.intentId);
        res.json({ message: 'Intent and associated matches deleted' });
    } catch(err) { 
        res.status(404).json({ error: err.message }); 
    }
};
