export default class Intent {
    constructor(id, personaId, data) {
        this.id = id;
        this.personaId = personaId;
        
        // User-provided data
        this.pickupLat = data.pickupLat;
        this.pickupLon = data.pickupLon;
        this.pickupLabel = data.pickupLabel;
        this.dropoffLat = data.dropoffLat;
        this.dropoffLon = data.dropoffLon;
        this.dropoffLabel = data.dropoffLabel;
        this.rideDate = data.rideDate;
        this.departureSlot = data.departureSlot;
        
        // System-computed 
        this.soloDurationSec = data.soloDurationSec || null;
        this.geohashCells = data.geohashCells || [];
        this.routeGeometry = data.routeGeometry || null;
        this.status = data.status || 'pending'; // pending, active, cancelled
        this.createdAt = new Date();
    }
}
