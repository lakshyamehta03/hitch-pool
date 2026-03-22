import { getDetailedRoute } from '../services/enrichmentService.js';

export const getMultiRoute = async (req, res) => {
    const { waypoints } = req.query; 
    
    if (!waypoints) {
        return res.status(400).json({ error: 'waypoints query parameter is required' });
    }
    
    const coordsStrList = waypoints.split(';');
    const coordsObjList = coordsStrList.map(pair => {
        const [lon, lat] = pair.split(',');
        return { lon: parseFloat(lon), lat: parseFloat(lat) };
    });
    
    try {
        const result = await getDetailedRoute(coordsObjList);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch multi-waypoint route from OSRM' });
    }
};
