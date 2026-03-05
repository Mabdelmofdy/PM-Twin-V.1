/**
 * Post-to-Post Scoring
 * Weighted match score between a Need post and an Offer post.
 * Weights: Attribute Overlap 40%, Budget Fit 30%, Timeline 15%, Location 10%, Reputation 5%.
 * Labels: Match / Partial / No Match per factor.
 */

(function (global) {
    const CONFIG = global.CONFIG || {};
    const W = CONFIG.MATCHING?.WEIGHTS || {
        ATTRIBUTE_OVERLAP: 0.40,
        BUDGET_FIT: 0.30,
        TIMELINE: 0.15,
        LOCATION: 0.10,
        REPUTATION: 0.05
    };
    const LABEL_PARTIAL = 0.25;

    /**
     * Label from raw score: 1 = Match, 0.25-0.99 = Partial, <0.25 = No Match
     */
    function labelFromScore(score) {
        if (score >= 1) return 'Match';
        if (score >= LABEL_PARTIAL) return 'Partial';
        return 'No Match';
    }

    /**
     * Attribute overlap: Jaccard-like overlap of skills/categories (and expanded if provided).
     */
    function attributeOverlap(needNorm, offerNorm, needProfile, offerProfile) {
        const needSkills = needProfile?.expandedSkillsOrCategories || needNorm.skills || [];
        const offerSkills = offerProfile?.expandedSkillsOrCategories || offerNorm.skills || [];
        const needSet = new Set((needSkills || []).map(s => String(s).toLowerCase()));
        const offerSet = new Set((offerSkills || []).map(s => String(s).toLowerCase()));
        if (needSet.size === 0 && offerSet.size === 0) return { score: 1, label: 'Match' };
        if (needSet.size === 0) return { score: 1, label: 'Match' };
        let intersection = 0;
        needSet.forEach(s => {
            if (offerSet.has(s)) intersection++;
            else {
                for (const o of offerSet) {
                    if (s.includes(o) || o.includes(s)) { intersection++; break; }
                }
            }
        });
        const union = needSet.size + offerSet.size - intersection;
        const score = union > 0 ? intersection / Math.max(needSet.size, 1) : 0;
        return { score, label: labelFromScore(score) };
    }

    /**
     * Budget fit: need range vs offer range. Full inside = 1, overlap = 0.5, disjoint = 0.
     */
    function budgetFit(needNorm, offerNorm) {
        const needB = needNorm.budget || {};
        const offerB = offerNorm.budget || {};
        const needMin = needB.min != null ? needB.min : 0;
        const needMax = needB.max != null ? needB.max : Infinity;
        const offerMin = offerB.min != null ? offerB.min : 0;
        const offerMax = offerB.max != null ? offerB.max : Infinity;
        if (needMax === Infinity && needMin === 0 && offerMin === 0 && offerMax === Infinity) return { score: 1, label: 'Match' };
        const overlapMin = Math.max(needMin, offerMin);
        const overlapMax = Math.min(needMax, offerMax);
        if (overlapMin > overlapMax) return { score: 0, label: 'No Match' };
        const needSpan = needMax - needMin;
        const overlapSpan = overlapMax - overlapMin;
        const score = needSpan > 0 ? overlapSpan / needSpan : 1;
        return { score, label: labelFromScore(score) };
    }

    /**
     * Timeline compatibility: overlap of need deadline/period and offer availability. 0-1.
     */
    function timelineFit(needNorm, offerNorm) {
        const needEnd = needNorm.deadline || needNorm.timeline?.end;
        const needStart = needNorm.timeline?.start;
        const offerStart = offerNorm.availability?.start || offerNorm.timeline?.start;
        const offerEnd = offerNorm.availability?.end || offerNorm.timeline?.end;
        const toDate = (s) => (s ? new Date(s).getTime() : null);
        const nEnd = toDate(needEnd);
        const nStart = toDate(needStart);
        const oStart = toDate(offerStart);
        const oEnd = toDate(offerEnd);
        if (nEnd == null && nStart == null && oStart == null && oEnd == null) return { score: 1, label: 'Match' };
        if (nEnd != null && oStart != null && oStart > nEnd) return { score: 0, label: 'No Match' };
        if (oEnd != null && nStart != null && nStart > oEnd) return { score: 0, label: 'No Match' };
        if (nStart != null && nEnd != null && oStart != null && oEnd != null) {
            const overlap = Math.max(0, Math.min(nEnd, oEnd) - Math.max(nStart, oStart));
            const needLen = nEnd - nStart;
            const score = needLen > 0 ? overlap / needLen : 0.5;
            return { score, label: labelFromScore(score) };
        }
        return { score: 0.5, label: 'Partial' };
    }

    /**
     * Location: Remote = 1, same = 1, same region = 0.5, else 0.
     */
    function locationFit(needNorm, offerNorm) {
        const needLoc = (needNorm.location || '').toLowerCase();
        const offerLoc = (offerNorm.location || '').toLowerCase();
        if (needLoc === 'remote' || offerLoc === 'remote') return { score: 1, label: 'Match' };
        if (needLoc === offerLoc) return { score: 1, label: 'Match' };
        if (needLoc === 'ksa' && offerLoc) return { score: 0.5, label: 'Partial' };
        if (offerLoc === 'ksa' && needLoc) return { score: 0.5, label: 'Partial' };
        return { score: 0, label: 'No Match' };
    }

    /**
     * Reputation: 0-1 from normalized post (creator rating).
     */
    function reputationScore(offerNorm) {
        const r = offerNorm.reputation != null ? Number(offerNorm.reputation) : 0.5;
        const score = isNaN(r) ? 0.5 : Math.max(0, Math.min(1, r));
        return { score, label: labelFromScore(score) };
    }

    /**
     * Compute full weighted score and breakdown.
     * @param {Object} needPost - Full Need opportunity
     * @param {Object} offerPost - Full Offer opportunity
     * @param {Object} [normalizedNeed] - needPost.normalized (optional, fallback to needPost.normalized)
     * @param {Object} [normalizedOffer] - offerPost.normalized
     * @param {Object} [semanticNeed] - optional semantic profile for need
     * @param {Object} [semanticOffer] - optional semantic profile for offer
     * @returns {Object} { score, breakdown, labels }
     */
    function scorePair(needPost, offerPost, normalizedNeed, normalizedOffer, semanticNeed, semanticOffer) {
        const nNorm = normalizedNeed || needPost.normalized || {};
        const oNorm = normalizedOffer || offerPost.normalized || {};

        const attr = attributeOverlap(nNorm, oNorm, semanticNeed, semanticOffer);
        const budget = budgetFit(nNorm, oNorm);
        const timeline = timelineFit(nNorm, oNorm);
        const location = locationFit(nNorm, oNorm);
        const reputation = reputationScore(oNorm);

        const breakdown = {
            attributeOverlap: attr.score,
            budgetFit: budget.score,
            timelineFit: timeline.score,
            locationFit: location.score,
            reputation: reputation.score
        };

        const labels = {
            attributeOverlap: attr.label,
            budgetFit: budget.label,
            timelineFit: timeline.label,
            locationFit: location.label,
            reputation: reputation.label
        };

        const score =
            attr.score * W.ATTRIBUTE_OVERLAP +
            budget.score * W.BUDGET_FIT +
            timeline.score * W.TIMELINE +
            location.score * W.LOCATION +
            reputation.score * W.REPUTATION;

        const rounded = Math.round(score * 1000) / 1000;
        if (CONFIG.MATCHING && CONFIG.MATCHING.DEBUG && needPost && offerPost && (rounded >= 0.45 && rounded <= 0.55)) {
            console.log('[post-to-post-scoring] need=' + (needPost.id || '') + ' offer=' + (offerPost.id || '') + ' score=' + rounded + ' threshold=0.50');
        }
        return {
            score: rounded,
            breakdown,
            labels
        };
    }

    const postToPostScoring = {
        scorePair,
        attributeOverlap,
        budgetFit,
        timelineFit,
        locationFit,
        reputationScore,
        labelFromScore
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = postToPostScoring;
    } else {
        global.postToPostScoring = postToPostScoring;
    }
})(typeof window !== 'undefined' ? window : globalThis);
