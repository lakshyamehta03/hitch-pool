export default class MatchingStrategy {
    /**
     * Evaluates whether two filtered intents form a viable carpool.
     * @param {Intent} newIntent 
     * @param {Intent} candidate 
     * @returns {Promise<Match | null>} Evaluated Match object if valid, else null
     */
    async evaluateMatch(newIntent, candidate) {
        throw new Error('Method not implemented.');
    }
}
