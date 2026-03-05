/**
 * Fill skill-canonical.json with synonyms from audit report (inconsistent skills and locations).
 * Run from repo root: node POC/scripts/fill-canonical-from-audit.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DOCS_DIR = path.join(__dirname, '..', 'docs');

const report = JSON.parse(fs.readFileSync(path.join(DOCS_DIR, 'audit-report.json'), 'utf8'));
const skillCanonical = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'skill-canonical.json'), 'utf8'));

const skillSynonyms = { ...skillCanonical.skillSynonyms };
report.inconsistentSkills.forEach(({ value }) => {
    if (!value) return;
    const key = value.toLowerCase().trim();
    if (!skillSynonyms[key]) skillSynonyms[key] = value;
});
skillCanonical.skillSynonyms = skillSynonyms;

const locationCanonical = { ...skillCanonical.locationCanonical };
const locationAdd = {
    'uae': 'UAE',
    'dubai-emirate': 'Dubai',
    'dubai': 'Dubai',
    'khobar': 'Al Khobar',
    'makkah': 'Makkah',
    'makkah-city': 'Makkah',
    'asir': 'Asir',
    'abha': 'Abha',
    'qa': 'Qatar',
    'doha': 'Doha',
    'eastern': 'Eastern Province',
    'tabuk-city': 'Tabuk',
    'kw': 'Kuwait',
    'al-asimah': 'Kuwait City',
    'kuwait-city': 'Kuwait City'
};
Object.entries(locationAdd).forEach(([k, v]) => { if (!locationCanonical[k]) locationCanonical[k] = v; });
skillCanonical.locationCanonical = locationCanonical;

fs.writeFileSync(path.join(DATA_DIR, 'skill-canonical.json'), JSON.stringify(skillCanonical, null, 2), 'utf8');
console.log('Updated skill-canonical.json: skillSynonyms', Object.keys(skillSynonyms).length, ', locationCanonical', Object.keys(locationCanonical).length);
