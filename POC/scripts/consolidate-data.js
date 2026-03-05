/**
 * Data Consolidation Script
 * Normalizes seed data: matches (userId→candidateId), sectors, skills, locations.
 * Run from repo root: node POC/scripts/consolidate-data.js
 * Writes back to POC/data/*.json (creates backup in POC/data/backup/ first).
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backup');
const DOMAINS = ['users', 'companies', 'opportunities', 'applications', 'matches', 'notifications', 'connections', 'messages', 'audit', 'sessions', 'contracts'];

const VALID_SECTORS = ['Construction', 'Infrastructure', 'Technology', 'Energy', 'Manufacturing', 'Real Estate', 'Transportation', 'Architecture', 'Engineering', 'Hospitality', 'Industrial', 'Agriculture', 'Education', 'Legal Services', 'Building', 'Commercial', 'Utilities', 'Oil and Gas'];

function loadJson(filename) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
}

function saveJson(filename, obj) {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf8');
}

function backup(filename) {
    const src = path.join(DATA_DIR, filename);
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const dest = path.join(BACKUP_DIR, filename);
    fs.copyFileSync(src, dest);
}

function normalizeSector(value) {
    if (!value || typeof value !== 'string') return value;
    const trimmed = value.trim();
    const found = VALID_SECTORS.find(c => c.toLowerCase() === trimmed.toLowerCase());
    return found != null ? found : trimmed;
}

function normalizeSectors(arr) {
    if (!Array.isArray(arr)) return arr;
    return arr.map(v => normalizeSector(v)).filter(Boolean);
}

function normalizeSkill(value, skillSynonyms) {
    if (!value || typeof value !== 'string') return value;
    const trimmed = value.trim();
    const key = trimmed.toLowerCase();
    return skillSynonyms[key] != null ? skillSynonyms[key] : trimmed;
}

function normalizeSkills(arr, skillSynonyms) {
    if (!Array.isArray(arr)) return arr;
    return arr.map(v => normalizeSkill(v, skillSynonyms)).filter(Boolean);
}

function normalizeLocationToken(value, locationCanonical) {
    if (!value || typeof value !== 'string') return value;
    const trimmed = value.trim();
    const key = trimmed.toLowerCase().replace(/\s+/g, ' ').replace(/-/g, '-');
    if (locationCanonical[key]) return locationCanonical[key];
    const token = key.split(/[\s>,]/)[0];
    return locationCanonical[token] != null ? locationCanonical[token] : trimmed;
}

function runConsolidation() {
    const skillCanonical = loadJson('skill-canonical.json') || {};
    const skillSynonyms = skillCanonical.skillSynonyms || {};
    const locationCanonical = skillCanonical.locationCanonical || {};
    const locationCanonicalLower = {};
    Object.entries(locationCanonical).forEach(([k, v]) => { locationCanonicalLower[k.toLowerCase().replace(/\s+/g, ' ')] = v; });

    // Backup
    DOMAINS.forEach(d => backup(`${d}.json`));

    let changes = { matches: 0, users: 0, companies: 0, opportunities: 0 };

    // --- Matches: userId → candidateId, matchReasons → criteria ---
    const matchesFile = loadJson('matches.json');
    if (matchesFile && Array.isArray(matchesFile.data)) {
        matchesFile.data.forEach(m => {
            if (m.userId != null && m.candidateId == null) {
                m.candidateId = m.userId;
                changes.matches++;
            }
            if (m.matchReasons != null && m.criteria == null) {
                m.criteria = m.matchReasons;
                changes.matches++;
            }
        });
        if (matchesFile.version === '1.0') matchesFile.version = '1.1';
        saveJson('matches.json', matchesFile);
    }

    // --- Users: sectors, industry, skills, specializations, location ---
    const usersFile = loadJson('users.json');
    if (usersFile && Array.isArray(usersFile.data)) {
        usersFile.data.forEach(u => {
            const p = u.profile || {};
            if (p.sectors && p.sectors.length) {
                const norm = normalizeSectors(p.sectors);
                if (JSON.stringify(norm) !== JSON.stringify(p.sectors)) { p.sectors = norm; changes.users++; }
            }
            if (p.industry) {
                const arr = Array.isArray(p.industry) ? p.industry : [p.industry];
                const norm = normalizeSectors(arr);
                if (JSON.stringify(norm) !== JSON.stringify(arr)) { p.industry = norm; changes.users++; }
            }
            if (p.skills && p.skills.length) {
                const norm = normalizeSkills(p.skills, skillSynonyms);
                if (JSON.stringify(norm) !== JSON.stringify(p.skills)) { p.skills = norm; changes.users++; }
            }
            if (p.specializations && p.specializations.length) {
                const norm = normalizeSkills(p.specializations, skillSynonyms);
                if (JSON.stringify(norm) !== JSON.stringify(p.specializations)) { p.specializations = norm; changes.users++; }
            }
            if (p.location && typeof p.location === 'string') {
                const parts = p.location.split(',').map(s => s.trim());
                const normalized = parts.map(part => {
                    const key = part.toLowerCase().replace(/\s+/g, ' ');
                    return locationCanonical[key] || locationCanonicalLower[key] || part;
                });
                const newLoc = normalized.join(', ');
                if (newLoc !== p.location) { p.location = newLoc; changes.users++; }
            }
        });
        saveJson('users.json', usersFile);
    }

    // --- Companies: sectors, industry, skills, services, location ---
    const companiesFile = loadJson('companies.json');
    if (companiesFile && Array.isArray(companiesFile.data)) {
        companiesFile.data.forEach(c => {
            const p = c.profile || {};
            if (p.sectors && p.sectors.length) {
                const norm = normalizeSectors(p.sectors);
                if (JSON.stringify(norm) !== JSON.stringify(p.sectors)) { p.sectors = norm; changes.companies++; }
            }
            if (p.industry) {
                const arr = Array.isArray(p.industry) ? p.industry : [p.industry];
                const norm = normalizeSectors(arr);
                if (JSON.stringify(norm) !== JSON.stringify(arr)) { p.industry = norm; changes.companies++; }
            }
            if (p.skills && p.skills.length) {
                const norm = normalizeSkills(p.skills, skillSynonyms);
                if (JSON.stringify(norm) !== JSON.stringify(p.skills)) { p.skills = norm; changes.companies++; }
            }
            if (p.services && p.services.length) {
                const norm = normalizeSkills(p.services, skillSynonyms);
                if (JSON.stringify(norm) !== JSON.stringify(p.services)) { p.services = norm; changes.companies++; }
            }
            if (p.location && typeof p.location === 'string') {
                const parts = p.location.split(',').map(s => s.trim());
                const normalized = parts.map(part => {
                    const key = part.toLowerCase().replace(/\s+/g, ' ');
                    return locationCanonical[key] || locationCanonicalLower[key] || part;
                });
                const newLoc = normalized.join(', ');
                if (newLoc !== p.location) { p.location = newLoc; changes.companies++; }
            }
        });
        saveJson('companies.json', companiesFile);
    }

    // --- Opportunities: scope.sectors, scope.requiredSkills, scope.offeredSkills, attributes.requiredSkills, location* ---
    const opportunitiesFile = loadJson('opportunities.json');
    if (opportunitiesFile && Array.isArray(opportunitiesFile.data)) {
        opportunitiesFile.data.forEach(o => {
            if (o.scope) {
                if (o.scope.sectors && o.scope.sectors.length) {
                    const norm = normalizeSectors(o.scope.sectors);
                    if (JSON.stringify(norm) !== JSON.stringify(o.scope.sectors)) { o.scope.sectors = norm; changes.opportunities++; }
                }
                if (o.scope.requiredSkills && o.scope.requiredSkills.length) {
                    const norm = normalizeSkills(o.scope.requiredSkills, skillSynonyms);
                    if (JSON.stringify(norm) !== JSON.stringify(o.scope.requiredSkills)) { o.scope.requiredSkills = norm; changes.opportunities++; }
                }
                if (o.scope.offeredSkills && o.scope.offeredSkills.length) {
                    const norm = normalizeSkills(o.scope.offeredSkills, skillSynonyms);
                    if (JSON.stringify(norm) !== JSON.stringify(o.scope.offeredSkills)) { o.scope.offeredSkills = norm; changes.opportunities++; }
                }
            }
            if (o.attributes && o.attributes.requiredSkills && o.attributes.requiredSkills.length) {
                const norm = normalizeSkills(o.attributes.requiredSkills, skillSynonyms);
                if (JSON.stringify(norm) !== JSON.stringify(o.attributes.requiredSkills)) { o.attributes.requiredSkills = norm; changes.opportunities++; }
            }
            if (o.locationRegion) {
                const key = o.locationRegion.toLowerCase().replace(/-/g, '-');
                const canon = locationCanonical[key] || locationCanonicalLower[key];
                if (canon && o.locationRegion !== canon) { o.locationRegion = canon; changes.opportunities++; }
            }
            if (o.locationCity) {
                const key = o.locationCity.toLowerCase().replace(/-/g, '-');
                const canon = locationCanonical[key] || locationCanonicalLower[key];
                if (canon && o.locationCity !== canon) { o.locationCity = canon; changes.opportunities++; }
            }
        });
        saveJson('opportunities.json', opportunitiesFile);
    }

    return changes;
}

function main() {
    if (!fs.existsSync(DATA_DIR)) {
        console.error('Data directory not found:', DATA_DIR);
        process.exit(1);
    }
    const changes = runConsolidation();
    console.log('Consolidation complete. Changes:', changes);
}

main();
