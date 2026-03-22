import express from 'express';
import { getAllPersonas, createPersona, deletePersona } from '../controllers/personaController.js';

const router = express.Router();

router.get('/', getAllPersonas);
router.post('/', createPersona);
router.delete('/:personaId', deletePersona);

export default router;