export default class CostSplitStrategy {
    /**
     * Calculates the fractional cost split between passenger A and B.
     * @param {Number} durationA - Time spent by first passenger in the shared route
     * @param {Number} durationB - Time spent by second passenger in the shared route
     * @returns {{splitA: Number, splitB: Number}} fractional splits summing to 1.0
     */
    calculateSplit(durationA, durationB) {
        throw new Error('Method not implemented.');
    }
}
