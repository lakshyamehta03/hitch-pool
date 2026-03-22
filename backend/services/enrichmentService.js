import { config } from '../config/env.js';
import geohash from 'ngeohash';

class EnrichmentService {
    
    async enrichIntent(intent) {
        const pHash = geohash.encode(intent.pickupLat, intent.pickupLon, config.GEOHASH_PRECISION);
        const dHash = geohash.encode(intent.dropoffLat, intent.dropoffLon, config.GEOHASH_PRECISION);
        
        intent.pickupGeohash = pHash;
        intent.dropoffGeohash = dHash;
        
        const waypoints = [
            { lat: intent.pickupLat, lon: intent.pickupLon },
            { lat: intent.dropoffLat, lon: intent.dropoffLon }
        ];
        
        const res = await this.getDetailedRoute(waypoints);
        intent.soloDurationSec = res.durationSec;
        intent.routeGeometry = res.geometry;
        
        return intent;
    }

    /**

     * Retrieves route details from OSRM.
     * @param {Array<{lat, lon}>} waypoints array of waypoints
     * @returns {Object} result containing durationSec and geometry
     */
    async getDetailedRoute(waypoints) {
        if (waypoints.length < 2) throw new Error("At least two waypoints required");

        const wpString = waypoints.map(wp => `${wp.lon},${wp.lat}`).join(';');
        const url = `${config.OSRM_BASE_URL}/route/v1/driving/${wpString}?overview=full&geometries=geojson`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`OSRM API Error: ${response.status}`);
            
            const data = await response.json();
            if (data.code !== 'Ok') throw new Error(`OSRM returns code: ${data.code}`);
            
            const route = data.routes[0];
            return {
                durationSec: route.duration,
                geometry: route.geometry.coordinates, // Array of [lon, lat]
                legs: route.legs.map(leg => ({ durationSec: leg.duration, distanceMeters: leg.distance }))
            };
        } catch (err) {
            console.error('Enrichment Service Error:', err);
            throw err;
        }
    }
}

const instance = new EnrichmentService();

export default instance;
export const getDetailedRoute = instance.getDetailedRoute.bind(instance);
export const enrichIntent = instance.enrichIntent.bind(instance);
