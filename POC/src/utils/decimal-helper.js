/**
 * Decimal Helper
 * Lightweight decimal-safe math utilities using integer scaling.
 * Avoids floating-point errors without requiring an external library.
 */

const DecimalHelper = (() => {

    const DEFAULT_PRECISION = 2;
    const SCALE = 1e12;

    function _countDecimals(n) {
        const s = String(n);
        const dot = s.indexOf('.');
        return dot === -1 ? 0 : s.length - dot - 1;
    }

    function _toSafe(n) {
        return Number(n) || 0;
    }

    /**
     * Multiply two numbers without float drift.
     * e.g. multiply(0.1, 0.2) => 0.02
     */
    function multiply(a, b) {
        const sa = _toSafe(a);
        const sb = _toSafe(b);
        const da = _countDecimals(sa);
        const db = _countDecimals(sb);
        const factor = Math.pow(10, da + db);
        return (Math.round(sa * Math.pow(10, da)) * Math.round(sb * Math.pow(10, db))) / factor;
    }

    /**
     * Divide a by b with configurable precision.
     * Returns 0 when b is 0 (safe guard).
     */
    function divide(a, b, precision) {
        const sb = _toSafe(b);
        if (sb === 0) return 0;
        const p = precision !== undefined ? precision : DEFAULT_PRECISION;
        const factor = Math.pow(10, p);
        return Math.round((_toSafe(a) / sb) * factor) / factor;
    }

    /**
     * Round a value to a given number of decimals.
     * method: 'round' (default) | 'floor' | 'ceil'
     */
    function roundTo(value, decimals, method) {
        const d = decimals !== undefined ? decimals : DEFAULT_PRECISION;
        const factor = Math.pow(10, d);
        const v = _toSafe(value);
        const m = method || 'round';
        if (m === 'floor') return Math.floor(v * factor) / factor;
        if (m === 'ceil') return Math.ceil(v * factor) / factor;
        return Math.round(v * factor) / factor;
    }

    /**
     * Sum any number of values with safe scaling to avoid accumulation drift.
     */
    function sumSafe() {
        const values = Array.prototype.slice.call(arguments);
        let total = 0;
        for (let i = 0; i < values.length; i++) {
            total += Math.round(_toSafe(values[i]) * SCALE);
        }
        return total / SCALE;
    }

    /**
     * Compute percentage: (part / whole) * 100, decimal-safe.
     */
    function percentage(part, whole, precision) {
        if (_toSafe(whole) === 0) return 0;
        return divide(multiply(_toSafe(part), 100), _toSafe(whole), precision !== undefined ? precision : DEFAULT_PRECISION);
    }

    return {
        multiply: multiply,
        divide: divide,
        roundTo: roundTo,
        sumSafe: sumSafe,
        percentage: percentage
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DecimalHelper;
} else {
    window.DecimalHelper = DecimalHelper;
}
