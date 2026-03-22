/**
 * Returns mins difference between two "HH:MM" strings.
 */
export function getTimeDiffMins(t1, t2) {
    const [h1, m1] = t1.split(':').map(Number);
    const [h2, m2] = t2.split(':').map(Number);
    return Math.abs((h1 * 60 + m1) - (h2 * 60 + m2));
}
