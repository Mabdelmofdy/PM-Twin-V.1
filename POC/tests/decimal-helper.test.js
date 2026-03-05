import { describe, it, expect } from 'vitest';

const DecimalHelper = await import('../src/utils/decimal-helper.js').then(m => m.default || m);

describe('DecimalHelper', () => {

    describe('multiply', () => {
        it('multiplies integers correctly', () => {
            expect(DecimalHelper.multiply(3, 4)).toBe(12);
        });

        it('avoids float drift with 0.1 * 0.2', () => {
            expect(DecimalHelper.multiply(0.1, 0.2)).toBe(0.02);
        });

        it('handles zero', () => {
            expect(DecimalHelper.multiply(100, 0)).toBe(0);
            expect(DecimalHelper.multiply(0, 100)).toBe(0);
        });

        it('handles negative numbers', () => {
            expect(DecimalHelper.multiply(-5, 3)).toBe(-15);
            expect(DecimalHelper.multiply(-2, -4)).toBe(8);
        });

        it('handles large numbers', () => {
            expect(DecimalHelper.multiply(10000000, 0.1)).toBe(1000000);
        });
    });

    describe('divide', () => {
        it('divides with default precision (2)', () => {
            expect(DecimalHelper.divide(10, 3)).toBe(3.33);
        });

        it('divides evenly', () => {
            expect(DecimalHelper.divide(10, 2)).toBe(5);
        });

        it('returns 0 when dividing by zero', () => {
            expect(DecimalHelper.divide(100, 0)).toBe(0);
        });

        it('respects custom precision', () => {
            expect(DecimalHelper.divide(10, 3, 4)).toBe(3.3333);
            expect(DecimalHelper.divide(10, 3, 0)).toBe(3);
        });

        it('handles negative values', () => {
            expect(DecimalHelper.divide(-10, 2)).toBe(-5);
        });
    });

    describe('roundTo', () => {
        it('rounds to 2 decimals by default (round)', () => {
            expect(DecimalHelper.roundTo(3.456)).toBe(3.46);
            expect(DecimalHelper.roundTo(3.454)).toBe(3.45);
        });

        it('floors correctly', () => {
            expect(DecimalHelper.roundTo(3.459, 2, 'floor')).toBe(3.45);
        });

        it('ceils correctly', () => {
            expect(DecimalHelper.roundTo(3.451, 2, 'ceil')).toBe(3.46);
        });

        it('rounds to 0 decimals', () => {
            expect(DecimalHelper.roundTo(3.7, 0)).toBe(4);
            expect(DecimalHelper.roundTo(3.2, 0)).toBe(3);
        });

        it('handles non-numeric gracefully', () => {
            expect(DecimalHelper.roundTo(undefined)).toBe(0);
            expect(DecimalHelper.roundTo(null)).toBe(0);
        });
    });

    describe('sumSafe', () => {
        it('sums basic values', () => {
            expect(DecimalHelper.sumSafe(1, 2, 3)).toBe(6);
        });

        it('avoids float drift with 0.1 + 0.2', () => {
            expect(DecimalHelper.sumSafe(0.1, 0.2)).toBe(0.3);
        });

        it('handles single value', () => {
            expect(DecimalHelper.sumSafe(42)).toBe(42);
        });

        it('handles no values', () => {
            expect(DecimalHelper.sumSafe()).toBe(0);
        });

        it('handles mix of positive and negative', () => {
            expect(DecimalHelper.sumSafe(10, -3, 0.5)).toBe(7.5);
        });
    });

    describe('percentage', () => {
        it('calculates percentage', () => {
            expect(DecimalHelper.percentage(25, 200)).toBe(12.5);
        });

        it('returns 0 when whole is 0', () => {
            expect(DecimalHelper.percentage(10, 0)).toBe(0);
        });

        it('respects custom precision', () => {
            expect(DecimalHelper.percentage(1, 3, 4)).toBe(33.3333);
        });
    });
});
