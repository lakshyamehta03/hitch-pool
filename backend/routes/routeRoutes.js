import express from 'express';
import { getMultiRoute } from '../controllers/routeController.js';

const router = express.Router();

router.get('/multi', getMultiRoute);

export default router;
