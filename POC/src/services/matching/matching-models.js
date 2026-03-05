/**
 * Matching Models
 * One-Way, Two-Way (Barter), Group (Consortium), Circular Exchange.
 */

(function (global) {
    const CONFIG = global.CONFIG || {};
    const POST_THRESHOLD = CONFIG.MATCHING?.POST_TO_POST_THRESHOLD ?? 0.50;
    const CANDIDATE_MAX = CONFIG.MATCHING?.CANDIDATE_MAX ?? 200;

    function getDataService() {
        return window.dataService || global.dataService;
    }

    function getScoring() {
        return window.postToPostScoring || global.postToPostScoring;
    }

    function getCandidateGenerator() {
        return window.candidateGenerator || global.candidateGenerator;
    }

    function getSemanticProfile() {
        return window.semanticProfile || global.semanticProfile;
    }

    function getPreprocessor() {
        return window.postPreprocessor || global.postPreprocessor;
    }

    /** Estimate numeric value (SAR) from opportunity for value equivalence. */
    function estimateValueSar(opportunity) {
        const ed = opportunity.exchangeData || {};
        const att = opportunity.attributes || {};
        if (ed.cashAmount != null) return Number(ed.cashAmount);
        if (ed.budgetRange && (ed.budgetRange.min != null || ed.budgetRange.max != null)) {
            const min = Number(ed.budgetRange.min);
            const max = Number(ed.budgetRange.max);
            if (!isNaN(min) && !isNaN(max)) return (min + max) / 2;
            if (!isNaN(min)) return min;
            if (!isNaN(max)) return max;
        }
        if (att.salaryRange && (att.salaryRange.min != null || att.salaryRange.max != null)) {
            const min = Number(att.salaryRange.min);
            const max = Number(att.salaryRange.max);
            if (!isNaN(min) && !isNaN(max)) return (min + max) / 2;
            if (!isNaN(min)) return min;
            if (!isNaN(max)) return max;
        }
        if (ed.barterValue != null) return Number(ed.barterValue);
        if (att.price != null) return Number(att.price);
        if (att.targetPrice != null) return Number(att.targetPrice);
        return null;
    }

    /** Value equivalence text e.g. "40 engineering hours" from two opportunities. */
    function valueEquivalenceText(oppA, oppB) {
        const valA = estimateValueSar(oppA);
        const valB = estimateValueSar(oppB);
        if (valA == null || valB == null || valB === 0) return null;
        const ratio = valA / valB;
        const titleB = oppB.title || 'units';
        return `~${ratio.toFixed(1)} × (${titleB})`;
    }

    /**
     * Model 1: One-Way. Find top Offer posts for a Need post.
     */
    async function findOffersForNeed(needPostId, options = {}) {
        const ds = getDataService();
        const scoring = getScoring();
        const gen = getCandidateGenerator();
        const semantic = getSemanticProfile();
        const preprocessor = getPreprocessor();

        const needPost = await ds.getOpportunityById(needPostId);
        if (!needPost) return { model: 'one_way', matches: [] };
        if ((needPost.intent || 'request') !== 'request') return { model: 'one_way', matches: [] };

        const all = await ds.getOpportunities();
        const offerPosts = all.filter(o => (o.intent || '') === 'offer' && o.status === 'published');

        const canonical = preprocessor ? await preprocessor.loadSkillCanonical(CONFIG.BASE_PATH || '') : {};
        let needNorm = needPost.normalized;
        if (!needNorm && preprocessor) needNorm = preprocessor.extractAndNormalize(needPost, canonical);
        const needProfile = semantic ? semantic.buildSemanticProfile(needNorm || {}, needPost, canonical) : null;

        const candidates = gen.getCandidates(needPost, offerPosts, {
            maxCandidates: options.maxCandidates ?? CANDIDATE_MAX,
            needNormalized: needNorm
        });

        const results = [];
        for (const offer of candidates) {
            const offerNorm = offer.normalized;
            const offerProfile = semantic && offerNorm ? semantic.buildSemanticProfile(offerNorm, offer, {}) : null;
            const { score, breakdown, labels } = scoring.scorePair(needPost, offer, needNorm, offerNorm, needProfile, offerProfile);
            if (CONFIG.MATCHING && CONFIG.MATCHING.DEBUG && score >= POST_THRESHOLD - 0.05 && score < POST_THRESHOLD) {
                console.log('[matching-models one-way] needId=' + needPostId + ' offerId=' + offer.id + ' score=' + score + ' below threshold ' + POST_THRESHOLD);
            }
            if (score < POST_THRESHOLD) continue;
            results.push({
                matchScore: score,
                breakdown,
                labels,
                suggestedPartners: [{ opportunityId: offer.id, creatorId: offer.creatorId }],
                matchedOpportunity: offer
            });
        }
        results.sort((a, b) => b.matchScore - a.matchScore);
        const topN = options.topN ?? 20;
        return { model: 'one_way', matches: results.slice(0, topN) };
    }

    /**
     * Model 2: Two-Way Barter. Both O_A satisfies N_B and O_B satisfies N_A.
     * Requires the current user (postA's creator) to have both a need and an offer.
     */
    async function findBarterMatches(opportunityId, options = {}) {
        const ds = getDataService();
        const scoring = getScoring();
        const preprocessor = getPreprocessor();

        const postA = await ds.getOpportunityById(opportunityId);
        if (!postA) return { model: 'two_way', matches: [] };

        const all = await ds.getOpportunities();
        const needPosts = all.filter(o => (o.intent || '') === 'request' && o.status === 'published');
        const offerPosts = all.filter(o => (o.intent || '') === 'offer' && o.status === 'published');

        const creatorIdA = postA.creatorId;
        const needA = needPosts.find(o => o.creatorId === creatorIdA);
        const offerA = offerPosts.find(o => o.creatorId === creatorIdA);
        if (!needA || !offerA) return { model: 'two_way', matches: [] };

        const canonical = preprocessor ? await preprocessor.loadSkillCanonical(CONFIG.BASE_PATH || '') : {};
        const normNeedA = needA.normalized || (preprocessor ? preprocessor.extractAndNormalize(needA, canonical) : {});
        const normOfferA = offerA.normalized || (preprocessor ? preprocessor.extractAndNormalize(offerA, canonical) : {});

        const matches = [];
        const otherNeeds = needPosts.filter(o => o.creatorId !== creatorIdA);
        const otherOffers = offerPosts.filter(o => o.creatorId !== creatorIdA);

        for (const needB of otherNeeds) {
            const offersByCreator = otherOffers.filter(o => o.creatorId === needB.creatorId);
            for (const offerB of offersByCreator) {
                const normNeedB = needB.normalized || (preprocessor ? preprocessor.extractAndNormalize(needB, canonical) : {});
                const normOfferB = offerB.normalized || (preprocessor ? preprocessor.extractAndNormalize(offerB, canonical) : {});

                const scoreAtoB = scoring.scorePair(needB, offerA, normNeedB, normOfferA).score;
                const scoreBtoA = scoring.scorePair(needA, offerB, normNeedA, normOfferB).score;

                if (scoreAtoB >= POST_THRESHOLD && scoreBtoA >= POST_THRESHOLD) {
                    const pairScore = (scoreAtoB + scoreBtoA) / 2;
                    const valueEquivalence = valueEquivalenceText(offerA, needB) || valueEquivalenceText(offerB, needA);
                    matches.push({
                        matchScore: pairScore,
                        breakdown: { scoreAtoB, scoreBtoA },
                        valueEquivalence: valueEquivalence || undefined,
                        suggestedPartners: [
                            { opportunityId: needB.id, creatorId: needB.creatorId },
                            { opportunityId: offerB.id, creatorId: offerB.creatorId }
                        ],
                        matchedNeed: needB,
                        matchedOffer: offerB
                    });
                }
            }
        }
        matches.sort((a, b) => b.matchScore - a.matchScore);
        return { model: 'two_way', matches };
    }

    /**
     * Model 3: Consortium. Decompose lead need into roles, find best Offer per role.
     */
    async function findConsortiumCandidates(leadNeedId, options = {}) {
        const ds = getDataService();
        const scoring = getScoring();
        const gen = getCandidateGenerator();
        const preprocessor = getPreprocessor();

        const leadNeed = await ds.getOpportunityById(leadNeedId);
        if (!leadNeed) return { model: 'consortium', matches: [], roles: [] };

        const att = leadNeed.attributes || {};
        const memberRoles = att.memberRoles || att.partnerRoles || [];
        const roles = Array.isArray(memberRoles)
            ? memberRoles.map(r => (typeof r === 'string' ? r : (r && (r.role || r.label)) || '')).filter(Boolean)
            : [];

        if (roles.length === 0) {
            const oneWay = await findOffersForNeed(leadNeedId, { topN: 10 });
            return { model: 'consortium', matches: oneWay.matches.map(m => ({ ...m, role: 'General' })), roles: ['General'] };
        }

        const all = await ds.getOpportunities();
        const offerPosts = all.filter(o => (o.intent || '') === 'offer' && o.status === 'published');
        const canonical = preprocessor ? await preprocessor.loadSkillCanonical(CONFIG.BASE_PATH || '') : {};
        const leadNorm = leadNeed.normalized || (preprocessor ? preprocessor.extractAndNormalize(leadNeed, canonical) : {});

        const usedCreatorIds = new Set([leadNeed.creatorId]);
        const suggestedPartners = [];
        const roleResults = [];

        for (const role of roles) {
            const syntheticNeed = {
                ...leadNeed,
                id: leadNeed.id + '-role-' + role.replace(/\s/g, '_'),
                scope: { ...(leadNeed.scope || {}), requiredSkills: [role].concat(leadNorm.skills || []).slice(0, 10) },
                normalized: { ...leadNorm, skills: [role].concat(leadNorm.skills || []).slice(0, 10) }
            };
            const candidates = gen.getCandidates(syntheticNeed, offerPosts, { needNormalized: syntheticNeed.normalized, maxCandidates: 50 });
            let best = null;
            let bestScore = POST_THRESHOLD;
            for (const offer of candidates) {
                if (usedCreatorIds.has(offer.creatorId)) continue;
                const { score } = scoring.scorePair(syntheticNeed, offer, syntheticNeed.normalized, offer.normalized);
                if (score > bestScore) {
                    bestScore = score;
                    best = offer;
                }
            }
            if (best) {
                usedCreatorIds.add(best.creatorId);
                roleResults.push({ role, opportunityId: best.id, creatorId: best.creatorId, matchScore: bestScore });
                suggestedPartners.push({ opportunityId: best.id, creatorId: best.creatorId, role });
            }
        }

        const aggregateScore = roleResults.length > 0
            ? roleResults.reduce((s, r) => s + r.matchScore, 0) / roleResults.length
            : 0;

        return {
            model: 'consortium',
            matches: [{
                matchScore: aggregateScore,
                breakdown: roleResults.reduce((acc, r) => ({ ...acc, [r.role]: r.matchScore }), {}),
                suggestedPartners
            }],
            roles
        };
    }

    /**
     * Model 4: Circular Exchange. Find cycles A→B→C→A (Offer_A satisfies Need_B, etc.).
     * Graph: nodes = creatorIds. Edge creatorI -> creatorJ if some offer from J satisfies some need from I.
     */
    async function findCircularExchanges(options = {}) {
        const minCycleLength = options.minCycleLength ?? 3;
        const ds = getDataService();
        const scoring = getScoring();
        const preprocessor = getPreprocessor();

        const all = await ds.getOpportunities();
        const published = all.filter(o => o.status === 'published');
        const needs = published.filter(o => (o.intent || '') === 'request');
        const offers = published.filter(o => (o.intent || '') === 'offer');

        const canonical = preprocessor ? await preprocessor.loadSkillCanonical(CONFIG.BASE_PATH || '') : {};
        const outEdges = {};
        const edgeDetails = {};

        for (const need of needs) {
            const needNorm = need.normalized || (preprocessor ? preprocessor.extractAndNormalize(need, canonical) : {});
            const fromCreator = need.creatorId;
            for (const offer of offers) {
                if (offer.creatorId === fromCreator) continue;
                const offerNorm = offer.normalized || (preprocessor ? preprocessor.extractAndNormalize(offer, canonical) : {});
                const { score } = scoring.scorePair(need, offer, needNorm, offerNorm);
                if (score >= POST_THRESHOLD) {
                    const toCreator = offer.creatorId;
                    if (!outEdges[fromCreator]) outEdges[fromCreator] = [];
                    if (!outEdges[fromCreator].includes(toCreator)) outEdges[fromCreator].push(toCreator);
                    const key = fromCreator + '->' + toCreator;
                    if (!edgeDetails[key]) edgeDetails[key] = { score, need, offer };
                    else if (score > edgeDetails[key].score) edgeDetails[key] = { score, need, offer };
                }
            }
        }

        const creatorIds = [...new Set([].concat(...Object.keys(outEdges), ...Object.values(outEdges).flat()))];
        const cycles = [];
        const path = [];
        const pathSet = new Set();

        function visit(node, depth, startNode) {
            if (depth >= minCycleLength && node === startNode && path.length >= minCycleLength) {
                cycles.push([...path]);
                return;
            }
            if (depth >= 6) return;
            const list = outEdges[node] || [];
            for (const next of list) {
                if (pathSet.has(next) && next !== startNode) continue;
                if (depth >= minCycleLength - 1 && next === startNode) {
                    path.push(next);
                    cycles.push([...path]);
                    path.pop();
                    continue;
                }
                pathSet.add(next);
                path.push(next);
                visit(next, depth + 1, startNode);
                path.pop();
                pathSet.delete(next);
            }
        }

        creatorIds.forEach(start => {
            path.length = 0;
            pathSet.clear();
            pathSet.add(start);
            visit(start, 0, start);
        });

        const uniqueCycles = [];
        const seen = new Set();
        cycles.forEach(cycle => {
            const key = cycle.slice().sort().join('|');
            if (seen.has(key)) return;
            seen.add(key);
            let cycleScore = 0;
            const suggestedPartners = [];
            for (let i = 0; i < cycle.length; i++) {
                const from = cycle[i];
                const to = cycle[(i + 1) % cycle.length];
                const edgeKey = from + '->' + to;
                const detail = edgeDetails[edgeKey];
                if (detail) {
                    cycleScore += detail.score;
                    suggestedPartners.push({
                        opportunityId: detail.offer?.id,
                        creatorId: to
                    });
                }
            }
            cycleScore = cycle.length > 0 ? cycleScore / cycle.length : 0;
            uniqueCycles.push({
                matchScore: cycleScore,
                cycle: cycle,
                suggestedPartners
            });
        });
        uniqueCycles.sort((a, b) => b.matchScore - a.matchScore);

        if (CONFIG.MATCHING && CONFIG.MATCHING.DEBUG) {
            console.log('[matching-models circular] cycles found=' + uniqueCycles.length + ' (cycle lengths: ' + uniqueCycles.slice(0, 5).map(c => c.cycle && c.cycle.length).join(', ') + ')');
        }
        return { model: 'circular', matches: uniqueCycles };
    }

    const matchingModels = {
        findOffersForNeed,
        findBarterMatches,
        findConsortiumCandidates,
        findCircularExchanges,
        estimateValueSar,
        valueEquivalenceText
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = matchingModels;
    } else {
        global.matchingModels = matchingModels;
    }
})(typeof window !== 'undefined' ? window : globalThis);
