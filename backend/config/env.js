import dotenv from 'dotenv';
dotenv.config();

export const config = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    OSRM_BASE_URL: process.env.OSRM_BASE_URL || 'http://router.project-osrm.org',
    PICKUP_PROXIMITY_KM: parseFloat(process.env.PICKUP_PROXIMITY_KM || '5'),
    DROPOFF_PROXIMITY_KM: parseFloat(process.env.DROPOFF_PROXIMITY_KM || '3'),
    JACCARD_THRESHOLD: parseFloat(process.env.JACCARD_THRESHOLD || '0.15'),
    GEOHASH_PRECISION: parseInt(process.env.GEOHASH_PRECISION || '6', 10),
    MAX_DETOUR_SEC: parseInt(process.env.MAX_DETOUR_SEC || '900', 10),
    MAX_DETOUR_RATIO: parseFloat(process.env.MAX_DETOUR_RATIO || '0.30'),
    MAX_DEPARTURE_DIFF_MIN: parseInt(process.env.MAX_DEPARTURE_DIFF_MIN || '30', 10)
};
