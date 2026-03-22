export default class FilterStrategy {
    /**
     * Determines if a candidate intent is eligible for a matching evaluation against the new intent.
     * @param {Intent} newIntent 
     * @param {Intent} candidate 
     * @returns {boolean} true if candidate is valid
     */
    isValid(newIntent, candidate) {
        throw new Error('Method not implemented.');
    }
}
