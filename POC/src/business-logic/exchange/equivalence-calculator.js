/**
 * Equivalence Calculator
 * Centralized, reusable engine for cross-mode value conversion.
 *
 * Supported assets: cash, equity, profit_sharing, barter, hybrid
 *
 * Usage:
 *   equivalenceCalculator.calculate(amount, fromAsset, toAsset, context?)
 *
 * Dependencies (loaded before this script):
 *   - DecimalHelper  (window.DecimalHelper)
 *   - ExchangeRules  (window.ExchangeRules)
 *   - CONFIG         (window.CONFIG)          — optional, for PAYMENT_MODES validation
 *   - storageService (window.storageService)  — optional, for override resolution
 */

class EquivalenceCalculator {

    constructor() {
        this._dh = null;
        this._rules = null;
    }

    // ── Lazy accessors ────────────────────────────────────────────────────

    get dh() {
        if (!this._dh) {
            this._dh = (typeof DecimalHelper !== 'undefined') ? DecimalHelper
                : (typeof window !== 'undefined' && window.DecimalHelper) ? window.DecimalHelper
                : null;
        }
        return this._dh;
    }

    get rules() {
        if (!this._rules) {
            this._rules = (typeof ExchangeRules !== 'undefined') ? ExchangeRules
                : (typeof window !== 'undefined' && window.ExchangeRules) ? window.ExchangeRules
                : null;
        }
        return this._rules;
    }

    // ── Supported asset types ─────────────────────────────────────────────

    get ASSETS() {
        return ['cash', 'equity', 'profit_sharing', 'barter', 'hybrid'];
    }

    _isValidAsset(asset) {
        return this.ASSETS.indexOf(asset) !== -1;
    }

    // ── Main API ──────────────────────────────────────────────────────────

    /**
     * Calculate the equivalence between two exchange modes.
     *
     * @param {number}  amount    - Source value (cash amount, equity %, profit-share %, barter multiplier, or total value for hybrid)
     * @param {string}  fromAsset - Source exchange mode
     * @param {string}  toAsset   - Target exchange mode
     * @param {object}  [context] - Additional context for conversion:
     *   - projectValue      (number) required for equity conversions
     *   - projectedRevenue  (number) required for profit-sharing conversions
     *   - barterValue       (number|string) required for barter conversions
     *   - tier              (string) subscription tier for override lookup
     *   - campaignId        (string) campaign id for override lookup
     *   - currency          (string) informational, default 'SAR'
     *   - hybridCash        (number) % for hybrid cash component
     *   - hybridEquity      (number) % for hybrid equity component
     *   - hybridBarter      (number) % for hybrid barter component
     * @returns {object} structured result
     */
    calculate(amount, fromAsset, toAsset, context) {
        var ctx = context || {};
        var DH = this.dh;
        var notes = [];

        // ── Input validation ──────────────────────────────────────────────
        if (!DH) {
            return this._errorResult('DecimalHelper not available — ensure decimal-helper.js is loaded first');
        }
        if (!this.rules) {
            return this._errorResult('ExchangeRules not available — ensure exchange-rules.js is loaded first');
        }

        var safeAmount = Number(amount);
        if (isNaN(safeAmount)) {
            return this._errorResult('Invalid amount: ' + amount);
        }
        if (!this._isValidAsset(fromAsset)) {
            return this._errorResult('Unknown source asset type: ' + fromAsset);
        }
        if (!this._isValidAsset(toAsset)) {
            return this._errorResult('Unknown target asset type: ' + toAsset);
        }

        // ── Hybrid decomposition ──────────────────────────────────────────
        if (fromAsset === 'hybrid') {
            return this._convertFromHybrid(safeAmount, toAsset, ctx);
        }
        if (toAsset === 'hybrid') {
            return this._convertToHybrid(safeAmount, fromAsset, ctx);
        }

        // ── Same-type identity ────────────────────────────────────────────
        if (fromAsset === toAsset) {
            return this._buildResult(safeAmount, {
                id: fromAsset + '_identity',
                name: fromAsset + ' identity',
                rate: 1,
                source: 'identity'
            }, safeAmount, 0, null, 'round', ['Same asset type — identity conversion']);
        }

        // ── Direct rule lookup ────────────────────────────────────────────
        var resolved = this.rules.resolveRule(fromAsset, toAsset, ctx);

        if (resolved.rule && typeof resolved.rule.convert === 'function') {
            var result = resolved.rule.convert(safeAmount, ctx);
            return this._buildResult(
                result.value,
                { id: resolved.rule.id, name: resolved.rule.name, rate: result.rate, source: resolved.source },
                result.value,
                0,
                null,
                'round',
                result.notes || []
            );
        }

        // ── Two-hop via cash pivot ────────────────────────────────────────
        if (fromAsset !== 'cash' && toAsset !== 'cash') {
            var toCash = this.rules.resolveRule(fromAsset, 'cash', ctx);
            var fromCash = this.rules.resolveRule('cash', toAsset, ctx);

            if (toCash.rule && fromCash.rule &&
                typeof toCash.rule.convert === 'function' &&
                typeof fromCash.rule.convert === 'function') {

                var step1 = toCash.rule.convert(safeAmount, ctx);
                if (step1.value === null) {
                    return this._buildResult(null, null, null, 0, null, 'round',
                        step1.notes.concat(['Two-hop conversion failed at step 1: ' + fromAsset + ' → cash']));
                }

                var step2 = fromCash.rule.convert(step1.value, ctx);
                var combinedNotes = (step1.notes || []).concat(step2.notes || []);
                combinedNotes.push('Converted via cash pivot: ' + fromAsset + ' → cash → ' + toAsset);

                return this._buildResult(
                    step2.value,
                    { id: fromAsset + '_to_' + toAsset + '_via_cash', name: fromAsset + ' to ' + toAsset + ' (via cash)', rate: null, source: 'derived' },
                    step2.value,
                    0,
                    null,
                    'round',
                    combinedNotes
                );
            }
        }

        // ── No rule found ─────────────────────────────────────────────────
        return this._buildResult(null, null, null, 0, null, 'round',
            ['No conversion rule found for ' + fromAsset + ' → ' + toAsset]);
    }

    // ── Hybrid handling ───────────────────────────────────────────────────

    /**
     * Convert a hybrid total value into a target asset by decomposing into
     * its component parts (cash / equity / barter percentages), converting each
     * component to the target, then summing.
     */
    _convertFromHybrid(totalValue, toAsset, ctx) {
        var DH = this.dh;
        var hCash = Number(ctx.hybridCash) || 0;
        var hEquity = Number(ctx.hybridEquity) || 0;
        var hBarter = Number(ctx.hybridBarter) || 0;
        var sum = DH.sumSafe(hCash, hEquity, hBarter);

        if (sum === 0) {
            return this._buildResult(null, null, null, 0, null, 'round',
                ['Hybrid decomposition failed: no component percentages provided (hybridCash, hybridEquity, hybridBarter)']);
        }

        var allNotes = ['Hybrid breakdown: ' + hCash + '% cash, ' + hEquity + '% equity, ' + hBarter + '% barter'];
        var runningTotal = 0;
        var partial;

        if (hCash > 0) {
            var cashPortion = DH.roundTo(DH.multiply(DH.divide(hCash, 100, 10), totalValue), 2);
            if (toAsset === 'cash') {
                runningTotal = DH.sumSafe(runningTotal, cashPortion);
                allNotes.push('Cash component: ' + cashPortion);
            } else {
                partial = this.calculate(cashPortion, 'cash', toAsset, ctx);
                if (partial.equivalentAmount !== null) {
                    runningTotal = DH.sumSafe(runningTotal, partial.equivalentAmount);
                }
                allNotes = allNotes.concat(partial.notes);
            }
        }

        if (hEquity > 0) {
            var equityPortion = DH.roundTo(DH.multiply(DH.divide(hEquity, 100, 10), totalValue), 2);
            partial = this.calculate(equityPortion, 'cash', toAsset, ctx);
            if (partial.equivalentAmount !== null) {
                runningTotal = DH.sumSafe(runningTotal, partial.equivalentAmount);
            }
            allNotes = allNotes.concat(partial.notes);
        }

        if (hBarter > 0) {
            var barterPortion = DH.roundTo(DH.multiply(DH.divide(hBarter, 100, 10), totalValue), 2);
            partial = this.calculate(barterPortion, 'cash', toAsset, ctx);
            if (partial.equivalentAmount !== null) {
                runningTotal = DH.sumSafe(runningTotal, partial.equivalentAmount);
            }
            allNotes = allNotes.concat(partial.notes);
        }

        return this._buildResult(
            DH.roundTo(runningTotal, 2),
            { id: 'hybrid_to_' + toAsset, name: 'Hybrid to ' + toAsset, rate: null, source: 'derived' },
            DH.roundTo(runningTotal, 2),
            0, null, 'round', allNotes
        );
    }

    /**
     * Convert from a single asset into a hybrid representation by allocating
     * the result across hybrid component percentages.
     */
    _convertToHybrid(amount, fromAsset, ctx) {
        var DH = this.dh;
        var hCash = Number(ctx.hybridCash) || 0;
        var hEquity = Number(ctx.hybridEquity) || 0;
        var hBarter = Number(ctx.hybridBarter) || 0;
        var sum = DH.sumSafe(hCash, hEquity, hBarter);

        if (sum === 0) {
            return this._buildResult(null, null, null, 0, null, 'round',
                ['Hybrid allocation failed: no component percentages provided']);
        }

        var cashResult = null;
        if (fromAsset !== 'cash') {
            var toCash = this.calculate(amount, fromAsset, 'cash', ctx);
            cashResult = toCash.equivalentAmount;
        } else {
            cashResult = amount;
        }

        if (cashResult === null) {
            return this._buildResult(null, null, null, 0, null, 'round',
                ['Cannot convert ' + fromAsset + ' to hybrid: intermediate cash conversion failed']);
        }

        var breakdown = {
            cashComponent: DH.roundTo(DH.multiply(DH.divide(hCash, 100, 10), cashResult), 2),
            equityComponent: DH.roundTo(DH.multiply(DH.divide(hEquity, 100, 10), cashResult), 2),
            barterComponent: DH.roundTo(DH.multiply(DH.divide(hBarter, 100, 10), cashResult), 2)
        };

        return this._buildResult(
            cashResult,
            { id: fromAsset + '_to_hybrid', name: fromAsset + ' to Hybrid', rate: null, source: 'derived' },
            cashResult,
            0, null, 'round',
            [
                'Allocated ' + cashResult + ' across hybrid: cash=' + breakdown.cashComponent +
                ', equity=' + breakdown.equityComponent + ', barter=' + breakdown.barterComponent
            ]
        );
    }

    // ── Result builders ───────────────────────────────────────────────────

    _buildResult(equivalentAmount, appliedRule, grossAmount, fee, cap, rounding, notes) {
        var DH = this.dh;
        var netAmount = equivalentAmount;
        if (netAmount !== null && fee) {
            netAmount = DH.sumSafe(equivalentAmount, -fee);
        }
        return {
            equivalentAmount: equivalentAmount,
            appliedRule: appliedRule,
            breakdown: {
                grossAmount: grossAmount,
                fee: fee || 0,
                cap: cap || null,
                rounding: rounding || 'round',
                netAmount: netAmount
            },
            notes: notes || []
        };
    }

    _errorResult(message) {
        return {
            equivalentAmount: null,
            appliedRule: null,
            breakdown: { grossAmount: null, fee: 0, cap: null, rounding: 'round', netAmount: null },
            notes: [message]
        };
    }
}

// Singleton
const equivalenceCalculator = new EquivalenceCalculator();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = equivalenceCalculator;
} else {
    window.equivalenceCalculator = equivalenceCalculator;
}
