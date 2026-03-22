import express from 'express';
import { searchLocation, reverseGeocode } from '../controllers/geocodeController.js';

const router = express.Router();

router.get('/search', searchLocation);
router.get('/reverse', reverseGeocode);

export default router;
