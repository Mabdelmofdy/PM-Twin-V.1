/**
 * Skill Service
 * Provides skill normalization, catalog lookup, and matching utilities.
 * Loads from skill-canonical.json and exposes a unified API for
 * profiles, opportunities, and the matching pipeline.
 */

class SkillService {
    constructor() {
        this._data = null;
        this._loading = null;
    }

    async _load() {
        if (this._data) return this._data;
        if (this._loading) return this._loading;

        this._loading = (async () => {
            try {
                const storage = window.storageService || (typeof storageService !== 'undefined' ? storageService : null);
                const overrideKey = window.CONFIG?.STORAGE_KEYS?.SKILL_CANONICAL_OVERRIDE;
                if (storage && overrideKey) {
                    const override = storage.get(overrideKey);
                    if (override && typeof override === 'object') {
                        this._data = override;
                        return this._data;
                    }
                }
                const basePath = (window.CONFIG && window.CONFIG.BASE_PATH) || '';
                const res = await fetch(basePath + 'data/skill-canonical.json');
                this._data = await res.json();
            } catch (e) {
                console.warn('SkillService: failed to load skill-canonical.json', e);
                this._data = { skillSynonyms: {}, skillCatalog: {}, categoryExpansion: {} };
            }
            return this._data;
        })();
        return this._loading;
    }

    async getCategories() {
        const data = await this._load();
        return Object.keys(data.skillCatalog || {});
    }

    async getSkillsByCategory(category) {
        const data = await this._load();
        return (data.skillCatalog || {})[category] || [];
    }

    async getAllSkills() {
        const data = await this._load();
        const catalog = data.skillCatalog || {};
        const all = new Set();
        for (const cat of Object.values(catalog)) {
            cat.forEach(s => all.add(s));
        }
        return Array.from(all).sort();
    }

    async getCatalog() {
        const data = await this._load();
        return data.skillCatalog || {};
    }

    /**
     * Normalize a single raw skill string using skillSynonyms.
     * Returns the canonical name, or the trimmed original if no synonym found.
     */
    async normalizeSkill(raw) {
        if (!raw) return '';
        const data = await this._load();
        const synonyms = data.skillSynonyms || {};
        const trimmed = String(raw).trim();
        const key = trimmed.toLowerCase();
        return synonyms[key] || trimmed;
    }

    /**
     * Normalize an array of skill strings. Deduplicates and returns canonical names.
     */
    async normalizeSkills(arr) {
        if (!arr || !Array.isArray(arr)) return [];
        const data = await this._load();
        const synonyms = data.skillSynonyms || {};
        const result = new Set();
        for (const raw of arr) {
            if (!raw) continue;
            const s = typeof raw === 'object' ? (raw.label || raw.name || '') : String(raw);
            const trimmed = s.trim();
            if (!trimmed) continue;
            const key = trimmed.toLowerCase();
            result.add(synonyms[key] || trimmed);
        }
        return Array.from(result);
    }

    /**
     * Compare two skill arrays and return match details.
     * @param {string[]} requiredSkills - skills the opportunity requires
     * @param {string[]} candidateSkills - skills the user/company has
     * @returns {{ matched: string[], unmatched: string[], score: number }}
     */
    async getMatchingSkills(requiredSkills, candidateSkills) {
        const normRequired = await this.normalizeSkills(requiredSkills);
        const normCandidate = await this.normalizeSkills(candidateSkills);
        const candidateSet = new Set(normCandidate.map(s => s.toLowerCase()));

        const matched = [];
        const unmatched = [];

        for (const skill of normRequired) {
            if (candidateSet.has(skill.toLowerCase())) {
                matched.push(skill);
            } else {
                unmatched.push(skill);
            }
        }

        const score = normRequired.length > 0
            ? matched.length / normRequired.length
            : 0;

        return { matched, unmatched, score };
    }

    /**
     * Search skills by query string (for autocomplete).
     * Returns skills whose canonical name contains the query.
     */
    async searchSkills(query) {
        if (!query || query.length < 1) return [];
        const allSkills = await this.getAllSkills();
        const q = query.toLowerCase();
        return allSkills.filter(s => s.toLowerCase().includes(q));
    }

    /**
     * Find the category for a given canonical skill name.
     */
    async getCategoryForSkill(skillName) {
        const data = await this._load();
        const catalog = data.skillCatalog || {};
        const lower = skillName.toLowerCase();
        for (const [category, skills] of Object.entries(catalog)) {
            if (skills.some(s => s.toLowerCase() === lower)) {
                return category;
            }
        }
        return null;
    }
}

const skillService = new SkillService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = skillService;
} else {
    window.skillService = skillService;
}
