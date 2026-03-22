export default class Match {
    constructor(id, intentAId, intentBId, quality) {
        this.id = id;
        this.intentAId = intentAId;
        this.intentBId = intentBId;
        
        this.detourSec = quality.detourSec;
        this.detourRatio = quality.detourRatio;
        this.sharedDurationSec = quality.sharedDurationSec;
        this.bestSequence = quality.bestSequence;
        
        // Lazy-loaded later
        this.sharedGeometry = null;
        
        // Computed purely client side in UI, left null or initialized empty here
        this.splitA = null;
        this.splitB = null;
    }
}
