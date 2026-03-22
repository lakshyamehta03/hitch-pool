import DefaultFilterStrategy from '../strategies/filter/DefaultFilterStrategy.js';
import OSRMMatchingStrategy from '../strategies/matching/OSRMMatchingStrategy.js';
import ProportionalTimeCostStrategy from '../strategies/cost/ProportionalTimeCostStrategy.js';

export class MatchingService {
    constructor(filterStrategy, matchStrategy, costSplitStrategy) {
        this.filterStrategy = filterStrategy || new DefaultFilterStrategy();
        this.costSplitStrategy = costSplitStrategy || new ProportionalTimeCostStrategy();
        this.matchStrategy = matchStrategy || new OSRMMatchingStrategy(this.costSplitStrategy);
    }

    /**
     * @param {FilterStrategy} strategy 
     */
    setFilterStrategy(strategy) {
        this.filterStrategy = strategy;
    }

    /**
     * @param {MatchingStrategy} strategy 
     */
    setMatchingStrategy(strategy) {
        this.matchStrategy = strategy;
    }

    /**
     * Finds matches for a newly created intent against a list of candidates.
     * @param {Intent} newIntent 
     * @param {Array<Intent>} existingIntents 
     * @returns {Promise<Array<Match>>}
     */
    async findMatches(newIntent, existingIntents) {
        const validMatches = [];
        
        // 1. Use the injected FilterStrategy to pre-filter candidates
        const candidates = existingIntents.filter(c => this.filterStrategy.isValid(newIntent, c));


        console.log('Candidates:', candidates.length);

        // 2. Use the injected MatchingStrategy to evaluate sequences and detours
        const concurrencyLimit = 5;
        const results = [];

        console.time('MatchingService.findMatches');
        for (let i = 0; i < candidates.length; i += concurrencyLimit) {
            const batch = candidates.slice(i, i + concurrencyLimit);

            const batchResults = await Promise.all(
                batch.map(c => this.matchStrategy.evaluateMatch(newIntent, c))
            );

            results.push(...batchResults);
        }
        console.timeEnd('MatchingService.findMatches');

        for (const match of results) {
            if (match) {
                validMatches.push(match);
            }
        }
        
        // Sort by detour ratio (lowest = best match)
        validMatches.sort((a, b) => a.detourRatio - b.detourRatio);
        
        // Return top 5
        return validMatches.slice(0, 5);
    }
}

// Export default singleton mapping to the existing procedural routing
const defaultMatchingService = new MatchingService();

export const findMatches = (newIntent, existingIntents) => {
    return defaultMatchingService.findMatches(newIntent, existingIntents);
};

export default defaultMatchingService;
