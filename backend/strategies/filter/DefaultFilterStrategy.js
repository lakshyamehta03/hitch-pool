import FilterStrategy from './FilterStrategy.js';
import { haversineDist } from '../../utils/geoUtils.js';
import { getTimeDiffMins } from '../../utils/timeUtils.js';
import { jaccardSimilarity } from '../../services/geohashService.js';
import { config } from '../../config/env.js';

export default class DefaultFilterStrategy extends FilterStrategy {
    isValid(newIntent, c) {
        if (c.id === newIntent.id || c.personaId === newIntent.personaId) return false;
        if (c.status !== 'active') return false;
        
        if (c.rideDate !== newIntent.rideDate) return false;
        if (getTimeDiffMins(c.departureSlot, newIntent.departureSlot) > config.MAX_DEPARTURE_DIFF_MIN) return false;
        
        const dPickup = haversineDist(newIntent.pickupLat, newIntent.pickupLon, c.pickupLat, c.pickupLon);
        const dDropoff = haversineDist(newIntent.dropoffLat, newIntent.dropoffLon, c.dropoffLat, c.dropoffLon);
        const sim = jaccardSimilarity(newIntent.geohashCells, c.geohashCells);
        
        if (dPickup <= config.PICKUP_PROXIMITY_KM || dDropoff <= config.DROPOFF_PROXIMITY_KM || sim >= config.JACCARD_THRESHOLD) {
            return true;
        }
        
        return false;
    }
}
