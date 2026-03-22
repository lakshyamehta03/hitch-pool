import geohash from 'ngeohash';

/**
 * Computes a unique set of geohash cells (precision 6) for a given route geometry.
 * @param {Array<Array<Number>>} coordinates - Array of [lon, lat] pairs
 * @returns {Array<String>} Array of unique geohash cells
 */
export function computeGeohashCells(coordinates) {
    const cells = new Set();
    
    coordinates.forEach(([lon, lat]) => {
        const cell = geohash.encode(lat, lon, 6);
        cells.add(cell);
        
        // Add all 8 neighbors
        const neighbors = geohash.neighbors(cell);
        neighbors.forEach(n => cells.add(n));
    });
    
    return Array.from(cells);
}

/**
 * Computes the Jaccard similarity index between two sets of geohashes.
 * @param {Array<String>} setA 
 * @param {Array<String>} setB 
 * @returns {Number} 0.0 to 1.0 (intersection / union)
 */
export function jaccardSimilarity(arrA, arrB) {
    if (!arrA || !arrB || arrA.length === 0 || arrB.length === 0) return 0;
    
    const setA = new Set(arrA);
    const setB = new Set(arrB);
    
    let intersectionSize = 0;
    for (const elem of setA) {
        if (setB.has(elem)) {
            intersectionSize++;
        }
    }
    
    const unionSize = setA.size + setB.size - intersectionSize;
    if (unionSize === 0) return 0;
    
    return intersectionSize / unionSize;
}

export default {
    computeGeohashCells,
    jaccardSimilarity
};
