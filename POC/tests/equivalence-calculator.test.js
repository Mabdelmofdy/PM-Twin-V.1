import { describe, it, expect, beforeAll } from 'vitest';

// Load modules in dependency order — they attach to globalThis via module.exports fallback
const DecimalHelper = await import('../src/utils/decimal-helper.js').then(m => m.default || m);
globalThis.DecimalHelper = DecimalHelper;

const ExchangeRules = await import('../src/business-logic/exchange/exchange-rules.js').then(m => m.default || m);
globalThis.ExchangeRules = ExchangeRules;

const { default: calculatorModule } = await import('../src/business-logic/exchange/equivalence-calculator.js');
const calculator = calculatorModule || (await import('../src/business-logic/exchange/equivalence-calculator.js')).default;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calc(amount, from, to, ctx) {
    return calculator.calculate(amount, from, to, ctx);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('EquivalenceCalculator', () => {

    // ── Identity / same-type ──────────────────────────────────────────────

    describe('identity conversions', () => {
        it('cash to cash returns same amount', () => {
            const r = calc(1000, 'cash', 'cash');
            expect(r.equivalentAmount).toBe(1000);
            expect(r.breakdown.fee).toBe(0);
            expect(r.appliedRule.source).toBe('identity');
        });

        it('equity to equity returns same value', () => {
            const r = calc(40, 'equity', 'equity');
            expect(r.equivalentAmount).toBe(40);
        });

        it('barter to barter returns same value', () => {
            const r = calc(1, 'barter', 'barter');
            expect(r.equivalentAmount).toBe(1);
        });

        it('profit_sharing to profit_sharing returns same value', () => {
            const r = calc(60, 'profit_sharing', 'profit_sharing');
            expect(r.equivalentAmount).toBe(60);
        });
    });

    // ── Equity ↔ Cash ─────────────────────────────────────────────────────

    describe('equity ↔ cash', () => {
        it('40% equity on 10M project = 4M cash', () => {
            const r = calc(40, 'equity', 'cash', { projectValue: 10000000 });
            expect(r.equivalentAmount).toBe(4000000);
            expect(r.appliedRule.id).toBe('equity_to_cash');
            expect(r.notes.length).toBeGreaterThan(0);
        });

        it('100% equity = full project value', () => {
            const r = calc(100, 'equity', 'cash', { projectValue: 5000000 });
            expect(r.equivalentAmount).toBe(5000000);
        });

        it('0% equity = 0', () => {
            const r = calc(0, 'equity', 'cash', { projectValue: 5000000 });
            expect(r.equivalentAmount).toBe(0);
        });

        it('returns null when projectValue missing', () => {
            const r = calc(40, 'equity', 'cash');
            expect(r.equivalentAmount).toBeNull();
            expect(r.notes[0]).toContain('projectValue');
        });

        it('cash to equity inverse: 4M cash on 10M project = 40%', () => {
            const r = calc(4000000, 'cash', 'equity', { projectValue: 10000000 });
            expect(r.equivalentAmount).toBe(40);
        });
    });

    // ── Profit-sharing ↔ Cash ─────────────────────────────────────────────

    describe('profit-sharing ↔ cash', () => {
        it('60% share of 1M revenue = 600K', () => {
            const r = calc(60, 'profit_sharing', 'cash', { projectedRevenue: 1000000 });
            expect(r.equivalentAmount).toBe(600000);
        });

        it('40% share of 1M revenue = 400K', () => {
            const r = calc(40, 'profit_sharing', 'cash', { projectedRevenue: 1000000 });
            expect(r.equivalentAmount).toBe(400000);
        });

        it('returns null when projectedRevenue missing', () => {
            const r = calc(60, 'profit_sharing', 'cash');
            expect(r.equivalentAmount).toBeNull();
            expect(r.notes[0]).toContain('projectedRevenue');
        });

        it('cash to profit_sharing inverse', () => {
            const r = calc(600000, 'cash', 'profit_sharing', { projectedRevenue: 1000000 });
            expect(r.equivalentAmount).toBe(60);
        });
    });

    // ── Barter ↔ Cash ─────────────────────────────────────────────────────

    describe('barter ↔ cash', () => {
        it('barter with numeric barterValue', () => {
            const r = calc(1, 'barter', 'cash', { barterValue: 50000 });
            expect(r.equivalentAmount).toBe(50000);
        });

        it('barter with string barterValue "Equivalent to 50K SAR"', () => {
            const r = calc(1, 'barter', 'cash', { barterValue: 'Equivalent to 50K SAR' });
            expect(r.equivalentAmount).toBe(50000);
        });

        it('barter with "2M" string', () => {
            const r = calc(1, 'barter', 'cash', { barterValue: '2M' });
            expect(r.equivalentAmount).toBe(2000000);
        });

        it('returns null for non-numeric barter description', () => {
            const r = calc(1, 'barter', 'cash', { barterValue: 'Office space in Riyadh' });
            expect(r.equivalentAmount).toBeNull();
            expect(r.notes[0]).toContain('no numeric barterValue');
        });

        it('returns null when barterValue missing', () => {
            const r = calc(1, 'barter', 'cash');
            expect(r.equivalentAmount).toBeNull();
        });

        it('cash to barter inverse', () => {
            const r = calc(50000, 'cash', 'barter', { barterValue: 50000 });
            expect(r.equivalentAmount).toBe(1);
        });
    });

    // ── Two-hop via cash pivot ────────────────────────────────────────────

    describe('two-hop conversions (via cash pivot)', () => {
        it('equity to profit_sharing via cash', () => {
            const ctx = { projectValue: 10000000, projectedRevenue: 5000000 };
            const r = calc(20, 'equity', 'profit_sharing', ctx);
            // 20% of 10M = 2M cash; 2M / 5M revenue * 100 = 40%
            expect(r.equivalentAmount).toBe(40);
            expect(r.notes.some(n => n.includes('cash pivot'))).toBe(true);
        });

        it('barter to equity via cash', () => {
            const ctx = { barterValue: 1000000, projectValue: 10000000 };
            const r = calc(1, 'barter', 'equity', ctx);
            // 1 barter = 1M cash; 1M / 10M * 100 = 10%
            expect(r.equivalentAmount).toBe(10);
        });
    });

    // ── Hybrid ────────────────────────────────────────────────────────────

    describe('hybrid conversions', () => {
        it('hybrid to cash decomposes by percentages', () => {
            const ctx = {
                hybridCash: 30,
                hybridEquity: 50,
                hybridBarter: 20,
                projectValue: 10000000,
                barterValue: 100000
            };
            const r = calc(1000000, 'hybrid', 'cash', ctx);
            // Cash portion: 30% of 1M = 300K (already cash → 300K)
            // Equity portion: 50% of 1M = 500K (cash → cash identity = 500K)
            // Barter portion: 20% of 1M = 200K (cash → cash identity = 200K)
            // Total = 300K + 500K + 200K = 1M
            expect(r.equivalentAmount).toBe(1000000);
        });

        it('hybrid fails when no component percentages', () => {
            const r = calc(1000000, 'hybrid', 'cash', {});
            expect(r.equivalentAmount).toBeNull();
            expect(r.notes[0]).toContain('no component percentages');
        });

        it('cash to hybrid allocates across components', () => {
            const ctx = { hybridCash: 50, hybridEquity: 30, hybridBarter: 20 };
            const r = calc(100000, 'cash', 'hybrid', ctx);
            expect(r.equivalentAmount).toBe(100000);
            expect(r.notes[0]).toContain('hybrid');
        });
    });

    // ── Edge cases ────────────────────────────────────────────────────────

    describe('edge cases', () => {
        it('zero amount returns zero for same-type', () => {
            const r = calc(0, 'cash', 'cash');
            expect(r.equivalentAmount).toBe(0);
        });

        it('negative amount is processed (no artificial constraint)', () => {
            const r = calc(-100, 'cash', 'cash');
            expect(r.equivalentAmount).toBe(-100);
        });

        it('unknown asset returns error', () => {
            const r = calc(100, 'gold', 'cash');
            expect(r.equivalentAmount).toBeNull();
            expect(r.notes[0]).toContain('Unknown source asset');
        });

        it('unknown target asset returns error', () => {
            const r = calc(100, 'cash', 'crypto');
            expect(r.equivalentAmount).toBeNull();
            expect(r.notes[0]).toContain('Unknown target asset');
        });

        it('NaN amount returns error', () => {
            const r = calc('abc', 'cash', 'cash');
            expect(r.equivalentAmount).toBeNull();
            expect(r.notes[0]).toContain('Invalid amount');
        });
    });

    // ── Rounding and decimal safety ───────────────────────────────────────

    describe('rounding and decimal safety', () => {
        it('equity conversion rounds to 2 decimal places', () => {
            const r = calc(33.33, 'equity', 'cash', { projectValue: 10000000 });
            const str = String(r.equivalentAmount);
            const decimals = str.includes('.') ? str.split('.')[1].length : 0;
            expect(decimals).toBeLessThanOrEqual(2);
        });

        it('profit-sharing result is deterministic', () => {
            const ctx = { projectedRevenue: 3000000 };
            const r1 = calc(33.33, 'profit_sharing', 'cash', ctx);
            const r2 = calc(33.33, 'profit_sharing', 'cash', ctx);
            expect(r1.equivalentAmount).toBe(r2.equivalentAmount);
        });

        it('breakdown includes rounding method', () => {
            const r = calc(1000, 'cash', 'cash');
            expect(r.breakdown.rounding).toBe('round');
        });
    });

    // ── Result structure ──────────────────────────────────────────────────

    describe('result structure', () => {
        it('contains all required fields', () => {
            const r = calc(1000, 'cash', 'cash');
            expect(r).toHaveProperty('equivalentAmount');
            expect(r).toHaveProperty('appliedRule');
            expect(r).toHaveProperty('breakdown');
            expect(r).toHaveProperty('notes');
            expect(r.breakdown).toHaveProperty('grossAmount');
            expect(r.breakdown).toHaveProperty('fee');
            expect(r.breakdown).toHaveProperty('cap');
            expect(r.breakdown).toHaveProperty('rounding');
            expect(r.breakdown).toHaveProperty('netAmount');
        });

        it('netAmount equals equivalentAmount when no fee', () => {
            const r = calc(1000, 'cash', 'cash');
            expect(r.breakdown.netAmount).toBe(r.equivalentAmount);
            expect(r.breakdown.fee).toBe(0);
        });

        it('notes is always an array', () => {
            const r = calc(1000, 'cash', 'cash');
            expect(Array.isArray(r.notes)).toBe(true);
        });
    });
});

// ─── ExchangeRules unit tests ─────────────────────────────────────────────────

describe('ExchangeRules', () => {

    describe('parseBarterValue', () => {
        it('parses plain number', () => {
            expect(ExchangeRules.parseBarterValue(50000)).toBe(50000);
        });

        it('parses "50K"', () => {
            expect(ExchangeRules.parseBarterValue('50K')).toBe(50000);
        });

        it('parses "2M"', () => {
            expect(ExchangeRules.parseBarterValue('2M')).toBe(2000000);
        });

        it('parses "1.5B"', () => {
            expect(ExchangeRules.parseBarterValue('1.5B')).toBe(1500000000);
        });

        it('parses "Equivalent to 50K SAR"', () => {
            expect(ExchangeRules.parseBarterValue('Equivalent to 50K SAR')).toBe(50000);
        });

        it('returns null for non-numeric text', () => {
            expect(ExchangeRules.parseBarterValue('Office space')).toBeNull();
        });

        it('returns null for null/undefined', () => {
            expect(ExchangeRules.parseBarterValue(null)).toBeNull();
            expect(ExchangeRules.parseBarterValue(undefined)).toBeNull();
        });
    });

    describe('resolveRule', () => {
        it('resolves default cash_to_cash rule', () => {
            const { rule, source } = ExchangeRules.resolveRule('cash', 'cash', {});
            expect(rule).not.toBeNull();
            expect(rule.id).toBe('cash_to_cash');
            expect(source).toBe('default');
        });

        it('resolves default equity_to_cash rule', () => {
            const { rule, source } = ExchangeRules.resolveRule('equity', 'cash', {});
            expect(rule).not.toBeNull();
            expect(source).toBe('default');
        });

        it('returns null for unsupported conversion', () => {
            const { rule, source } = ExchangeRules.resolveRule('gold', 'cash', {});
            expect(rule).toBeNull();
            expect(source).toBeNull();
        });
    });

    describe('ruleKey', () => {
        it('generates correct key', () => {
            expect(ExchangeRules.ruleKey('equity', 'cash')).toBe('equity_to_cash');
        });
    });
});
