import geocodeService from '../services/geocodeService.js';

export const searchLocation = async (req, res) => {
    try {
        const { q, limit = 5 } = req.query;
        if (!q || q.length < 5) {
            return res.json([]);
        }
        const results = await geocodeService.searchLocation(q, limit);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Geocoding failed' });
    }
};

export const reverseGeocode = async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'lat and lon required' });
        }
        const label = await geocodeService.reverseGeocode(lat, lon);
        res.json({ label });
    } catch (err) {
        res.status(500).json({ error: 'Reverse geocoding failed' });
    }
};
