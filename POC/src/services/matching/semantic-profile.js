/**
 * Semantic Profile
 * Builds a semantic profile (structured + category tags + expanded skills/categories)
 * for matching. Option A (MVP): category expansion and keyword mapping, no embeddings.
 */

(function (global) {
    let categoryExpansionCache = null;

    /**
     * Load category/skill expansion from skill-canonical (same file as synonyms).
     * @param {string} [basePath='']
     */
    async function loadCategoryExpansion(basePath = '') {
        if (categoryExpansionCache) return categoryExpansionCache;
        try {
            const path = (basePath || (global.CONFIG && global.CONFIG.BASE_PATH) || '') + 'data/skill-canonical.json';
            const res = await fetch(path);
            const data = await res.json();
            categoryExpansionCache = data.categoryExpansion || {};
            return categoryExpansionCache;
        } catch (e) {
            categoryExpansionCache = {};
            return categoryExpansionCache;
        }
    }

    /**
     * Expand a single term using categoryExpansion map (e.g. "shop drawing review" -> ["Structural Engineering", "Design", "Review"]).
     */
    function expandTerm(term, categoryExpansion = {}) {
        if (!term || typeof term !== 'string') return [];
        const key = term.toLowerCase().trim();
        const expanded = categoryExpansion[key];
        if (Array.isArray(expanded)) return expanded;
        if (typeof expanded === 'string') return [expanded];
        return [term];
    }

    /**
     * Build semantic profile from normalized post and optional raw opportunity (for title/description expansion).
     * @param {Object} normalizedPost - Output from postPreprocessor.extractAndNormalize
     * @param {Object} [opportunity] - Raw opportunity for title/description
     * @param {Object} [canonicalMap] - { categoryExpansion }
     * @returns {Object} { structured, categoryTags, expandedSkillsOrCategories }
     */
    function buildSemanticProfile(normalizedPost, opportunity = null, canonicalMap = {}) {
        const expansion = canonicalMap.categoryExpansion || {};
        const categoryTags = [].concat(
            normalizedPost.categories || [],
            normalizedPost.modelType ? [normalizedPost.modelType] : [],
            normalizedPost.subModelType ? [normalizedPost.subModelType] : []
        ).filter(Boolean);
        const uniqueTags = [...new Set(categoryTags)];

        const expandedSet = new Set(normalizedPost.skills || []);
        (normalizedPost.skills || []).forEach(skill => {
            expandTerm(skill, expansion).forEach(t => expandedSet.add(t));
        });
        if (opportunity && (opportunity.title || opportunity.description)) {
            const text = [opportunity.title, opportunity.description].filter(Boolean).join(' ').toLowerCase();
            Object.keys(expansion).forEach(key => {
                if (text.includes(key)) {
                    (expansion[key] && (Array.isArray(expansion[key]) ? expansion[key] : [expansion[key]])).forEach(t => expandedSet.add(t));
                }
            });
        }
        const expandedSkillsOrCategories = [...expandedSet];

        return {
            structured: normalizedPost,
            categoryTags: uniqueTags,
            expandedSkillsOrCategories
        };
    }

    const semanticProfile = {
        loadCategoryExpansion,
        expandTerm,
        buildSemanticProfile
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = semanticProfile;
    } else {
        global.semanticProfile = semanticProfile;
    }
})(typeof window !== 'undefined' ? window : globalThis);
