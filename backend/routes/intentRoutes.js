import express from 'express';
import { 
    getAllActiveIntents, 
    getMatchesForPersona, 
    getAllMatches, 
    createIntent, 
    deleteIntent 
} from '../controllers/intentController.js';

const router = express.Router();

router.get('/', getAllActiveIntents);
router.get('/matches/:personaId', getMatchesForPersona);
router.get('/matches', getAllMatches);
router.post('/', createIntent);
router.delete('/:intentId', deleteIntent);

export default router;