/**
 * Exchange Rules
 * Default rule table and resolution logic for the Equivalence Calculator.
 * Rules convert a source exchange mode amount into a cash-equivalent value.
 *
 * Resolution priority:
 *   1. Campaign override  (SYSTEM_SETTINGS.exchangeRules.campaigns[id])
 *   2. Tier override      (SYSTEM_SETTINGS.exchangeRules.tiers[name])
 *   3. Admin custom rule  (SYSTEM_SETTINGS.exchangeRules.custom[key])
 *   4. Default built-in   (DEFAULT_RULES below)
 */

const ExchangeRules = (() => {

    // ── Default built-in rules ────────────────────────────────────────────
    // Each rule is a function: (amount, context) => { value, notes }
    // `value` is the cash-equivalent numeric result (or null if indeterminate).
    // `notes` collects human-readable explanation strings.

    const DEFAULT_RULES = {

        /**
         * Cash → Cash: identity conversion.
         * Multi-currency placeholder — currently all values are SAR.
         */
        cash_to_cash: {
            id: 'cash_to_cash',
            name: 'Cash Identity',
            fromAsset: 'cash',
            toAsset: 'cash',
            convert: function (amount, _ctx) {
                return {
                    value: amount,
                    rate: 1,
                    notes: ['1:1 cash identity conversion']
                };
            }
        },

        /**
         * Equity → Cash: equity percentage applied to project value.
         * Requires context.projectValue.
         */
        equity_to_cash: {
            id: 'equity_to_cash',
            name: 'Equity to Cash',
            fromAsset: 'equity',
            toAsset: 'cash',
            convert: function (amount, ctx) {
                var DH = _dh();
                var projectValue = (ctx && ctx.projectValue) || 0;
                if (!projectValue) {
                    return { value: null, rate: null, notes: ['Cannot convert equity to cash: projectValue not provided in context'] };
                }
                var cashEquivalent = DH.multiply(DH.divide(amount, 100, 10), projectValue);
                return {
                    value: DH.roundTo(cashEquivalent, 2),
                    rate: DH.divide(projectValue, 100, 10),
                    notes: [amount + '% equity of ' + projectValue + ' = ' + DH.roundTo(cashEquivalent, 2)]
                };
            }
        },

        /**
         * Cash → Equity: inverse of equity_to_cash.
         * Requires context.projectValue.
         */
        cash_to_equity: {
            id: 'cash_to_equity',
            name: 'Cash to Equity',
            fromAsset: 'cash',
            toAsset: 'equity',
            convert: function (amount, ctx) {
                var DH = _dh();
                var projectValue = (ctx && ctx.projectValue) || 0;
                if (!projectValue) {
                    return { value: null, rate: null, notes: ['Cannot convert cash to equity: projectValue not provided in context'] };
                }
                var equityPct = DH.divide(DH.multiply(amount, 100), projectValue, 4);
                return {
                    value: DH.roundTo(equityPct, 4),
                    rate: DH.divide(100, projectValue, 10),
                    notes: [amount + ' cash / ' + projectValue + ' project value = ' + DH.roundTo(equityPct, 4) + '%']
                };
            }
        },

        /**
         * Profit-sharing → Cash: split percentage applied to projected revenue.
         * `amount` is the profit-share percentage (e.g. 60 for a 60% share).
         * Requires context.projectedRevenue.
         */
        profit_sharing_to_cash: {
            id: 'profit_sharing_to_cash',
            name: 'Profit-Sharing to Cash',
            fromAsset: 'profit_sharing',
            toAsset: 'cash',
            convert: function (amount, ctx) {
                var DH = _dh();
                var revenue = (ctx && ctx.projectedRevenue) || 0;
                if (!revenue) {
                    return { value: null, rate: null, notes: ['Cannot convert profit-sharing to cash: projectedRevenue not provided in context'] };
                }
                var cashEquivalent = DH.multiply(DH.divide(amount, 100, 10), revenue);
                return {
                    value: DH.roundTo(cashEquivalent, 2),
                    rate: DH.divide(revenue, 100, 10),
                    notes: [amount + '% share of ' + revenue + ' projected revenue = ' + DH.roundTo(cashEquivalent, 2)]
                };
            }
        },

        /**
         * Cash → Profit-sharing: inverse.
         * Requires context.projectedRevenue.
         */
        cash_to_profit_sharing: {
            id: 'cash_to_profit_sharing',
            name: 'Cash to Profit-Sharing',
            fromAsset: 'cash',
            toAsset: 'profit_sharing',
            convert: function (amount, ctx) {
                var DH = _dh();
                var revenue = (ctx && ctx.projectedRevenue) || 0;
                if (!revenue) {
                    return { value: null, rate: null, notes: ['Cannot convert cash to profit-sharing: projectedRevenue not provided in context'] };
                }
                var pct = DH.divide(DH.multiply(amount, 100), revenue, 4);
                return {
                    value: DH.roundTo(pct, 4),
                    rate: DH.divide(100, revenue, 10),
                    notes: [amount + ' cash / ' + revenue + ' projected revenue = ' + DH.roundTo(pct, 4) + '%']
                };
            }
        },

        /**
         * Barter → Cash: uses the numeric barterValue from context.
         * `amount` is treated as a multiplier (usually 1 = the whole barter).
         */
        barter_to_cash: {
            id: 'barter_to_cash',
            name: 'Barter to Cash',
            fromAsset: 'barter',
            toAsset: 'cash',
            convert: function (amount, ctx) {
                var DH = _dh();
                var raw = (ctx && ctx.barterValue) || null;
                var numeric = _parseBarterValue(raw);
                if (numeric === null) {
                    return { value: null, rate: null, notes: ['Cannot convert barter to cash: no numeric barterValue available (received: ' + raw + ')'] };
                }
                var cashEquivalent = DH.multiply(amount, numeric);
                return {
                    value: DH.roundTo(cashEquivalent, 2),
                    rate: numeric,
                    notes: ['Barter valued at ' + numeric + ' cash equivalent (x' + amount + ' = ' + DH.roundTo(cashEquivalent, 2) + ')']
                };
            }
        },

        /**
         * Cash → Barter: inverse.
         */
        cash_to_barter: {
            id: 'cash_to_barter',
            name: 'Cash to Barter',
            fromAsset: 'cash',
            toAsset: 'barter',
            convert: function (amount, ctx) {
                var DH = _dh();
                var raw = (ctx && ctx.barterValue) || null;
                var numeric = _parseBarterValue(raw);
                if (numeric === null || numeric === 0) {
                    return { value: null, rate: null, notes: ['Cannot convert cash to barter: no numeric barterValue available'] };
                }
                var units = DH.divide(amount, numeric, 4);
                return {
                    value: DH.roundTo(units, 4),
                    rate: DH.divide(1, numeric, 10),
                    notes: [amount + ' cash / ' + numeric + ' barter value = ' + DH.roundTo(units, 4) + ' barter units']
                };
            }
        }
    };

    // ── Helpers ────────────────────────────────────────────────────────────

    function _dh() {
        return (typeof DecimalHelper !== 'undefined') ? DecimalHelper
            : (typeof window !== 'undefined' && window.DecimalHelper) ? window.DecimalHelper
            : null;
    }

    /**
     * Extract a numeric value from a barterValue that may be a number or a
     * descriptive string like "Equivalent to 50K SAR".
     */
    function _parseBarterValue(raw) {
        if (raw === null || raw === undefined) return null;
        if (typeof raw === 'number') return raw;
        var s = String(raw).replace(/,/g, '');
        var match = s.match(/([\d.]+)\s*([KkMmBb])?/);
        if (!match) return null;
        var num = parseFloat(match[1]);
        if (isNaN(num)) return null;
        var suffix = (match[2] || '').toUpperCase();
        if (suffix === 'K') num *= 1000;
        else if (suffix === 'M') num *= 1000000;
        else if (suffix === 'B') num *= 1000000000;
        return num;
    }

    // ── Rule key builder ──────────────────────────────────────────────────

    function _ruleKey(from, to) {
        return from + '_to_' + to;
    }

    // ── Resolution engine ─────────────────────────────────────────────────

    /**
     * Resolve the best matching rule given from/to assets and optional context.
     * Returns { rule, source } where source is 'campaign' | 'tier' | 'custom' | 'default' | null.
     */
    function resolveRule(fromAsset, toAsset, context) {
        var key = _ruleKey(fromAsset, toAsset);
        var overrides = _loadOverrides();

        // 1. Campaign override
        if (context && context.campaignId && overrides.campaigns) {
            var campaign = overrides.campaigns[context.campaignId];
            if (campaign && campaign[key]) {
                return { rule: campaign[key], source: 'campaign' };
            }
        }

        // 2. Tier override
        if (context && context.tier && overrides.tiers) {
            var tierRules = overrides.tiers[context.tier];
            if (tierRules && tierRules[key]) {
                return { rule: tierRules[key], source: 'tier' };
            }
        }

        // 3. Admin custom rule
        if (overrides.custom && overrides.custom[key]) {
            return { rule: overrides.custom[key], source: 'custom' };
        }

        // 4. Default built-in rule
        if (DEFAULT_RULES[key]) {
            return { rule: DEFAULT_RULES[key], source: 'default' };
        }

        return { rule: null, source: null };
    }

    /**
     * Load exchange rule overrides from SYSTEM_SETTINGS (localStorage).
     */
    function _loadOverrides() {
        try {
            var storage = (typeof storageService !== 'undefined') ? storageService
                : (typeof window !== 'undefined' && window.storageService) ? window.storageService
                : null;
            var settingsKey = (typeof CONFIG !== 'undefined') ? CONFIG.STORAGE_KEYS.SYSTEM_SETTINGS
                : (typeof window !== 'undefined' && window.CONFIG) ? window.CONFIG.STORAGE_KEYS.SYSTEM_SETTINGS
                : null;
            if (!storage || !settingsKey) return {};
            var settings = storage.get(settingsKey) || {};
            return settings.exchangeRules || {};
        } catch (_e) {
            return {};
        }
    }

    // ── Public API ────────────────────────────────────────────────────────

    return {
        resolveRule: resolveRule,
        DEFAULT_RULES: DEFAULT_RULES,
        parseBarterValue: _parseBarterValue,
        ruleKey: _ruleKey
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExchangeRules;
} else {
    window.ExchangeRules = ExchangeRules;
}
