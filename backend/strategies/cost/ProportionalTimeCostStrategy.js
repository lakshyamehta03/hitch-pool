import CostSplitStrategy from './CostSplitStrategy.js';

export default class ProportionalTimeCostStrategy extends CostSplitStrategy {
    calculateSplit(durationA, durationB) {
        const total = durationA + durationB;
        if (total === 0) {
            return { splitA: 0.5, splitB: 0.5 };
        }
        
        const splitA = durationA / total;
        const splitB = durationB / total;
        
        return { splitA, splitB };
    }
}
