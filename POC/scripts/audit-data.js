/**
 * Data Audit Script
 * Reads POC/data/*.json, runs audit checks, and outputs Data Audit Summary.
 * Run from repo root: node POC/scripts/audit-data.js
 * Output: POC/docs/DATA_AUDIT_SUMMARY.md and POC/docs/audit-report.json
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const DOMAINS = ['users', 'companies', 'opportunities', 'applications', 'matches', 'notifications', 'connections', 'messages', 'audit', 'sessions', 'contracts'];

const VALID_SECTORS = ['Construction', 'Infrastructure', 'Technology', 'Energy', 'Manufacturing', 'Real Estate', 'Transportation', 'Architecture', 'Engineering', 'Hospitality', 'Industrial', 'Agriculture', 'Education', 'Legal Services'];

function loadJson(filename) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);
    return json.data != null ? json.data : json;
}

function loadJsonFile(filePath) {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function collectIds(arr) {
    const byId = new Map();
    const byEmail = new Map();
    (arr || []).forEach((r, i) => {
        if (r.id) byId.set(r.id, (byId.get(r.id) || []).concat([{ index: i, record: r }]));
        if (r.email) byEmail.set(r.email.toLowerCase(), (byEmail.get(r.email.toLowerCase()) || []).concat([{ index: i, record: r }]));
    });
    return { byId, byEmail };
}

function runAudit() {
    const report = {
        timestamp: new Date().toISOString(),
        duplicates: {},
        incompleteProfiles: { users: [], companies: [] },
        orphans: { applications: [], matches: [], notifications: [], connections: [], messages: [], contracts: [], opportunities: [] },
        inconsistentSectors: [],
        inconsistentSkills: [],
        inconsistentLocations: [],
        unusedTables: [],
        domainCounts: {}
    };

    // Load seed data
    const data = {};
    for (const domain of DOMAINS) {
        data[domain] = loadJson(`${domain}.json`) || [];
        report.domainCounts[domain] = data[domain].length;
    }

    const lookups = loadJsonFile(path.join(DATA_DIR, 'lookups.json')) || {};
    const skillCanonical = loadJsonFile(path.join(DATA_DIR, 'skill-canonical.json')) || {};
    const locations = loadJsonFile(path.join(DATA_DIR, 'locations.json')) || {};
    const skillSynonyms = skillCanonical.skillSynonyms || {};
    const locationCanonical = skillCanonical.locationCanonical || {};
    const targetSectors = lookups.targetSectors || [];
    const canonicalSectors = [...new Set([...VALID_SECTORS, ...targetSectors])].filter(Boolean);

    const userIds = new Set((data.users || []).map(u => u.id));
    const companyIds = new Set((data.companies || []).map(c => c.id));
    const allEntityIds = new Set([...userIds, ...companyIds]);
    const opportunityIds = new Set((data.opportunities || []).map(o => o.id));

    // --- Duplicates ---
    for (const domain of DOMAINS) {
        const arr = data[domain];
        const { byId, byEmail } = collectIds(arr);
        const dupIds = [...byId.entries()].filter(([_, list]) => list.length > 1).map(([id, list]) => ({ id, count: list.length }));
        const dupEmails = (domain === 'users' || domain === 'companies') ? [...byEmail.entries()].filter(([_, list]) => list.length > 1).map(([email, list]) => ({ email, count: list.length })) : [];
        report.duplicates[domain] = { byId: dupIds, byEmail: dupEmails };
    }

    // --- Incomplete profiles (users) ---
    (data.users || []).forEach((u, i) => {
        const p = u.profile || {};
        const missing = [];
        if (!u.profile) missing.push('profile');
        else {
            if (!(p.skills && p.skills.length) && !(p.specializations && p.specializations.length)) missing.push('skills/specializations');
            if (!p.location) missing.push('location');
            if (p.yearsExperience == null && p.experience == null) missing.push('yearsExperience');
            if (!p.preferredPaymentModes || !p.preferredPaymentModes.length) missing.push('preferredPaymentModes');
        }
        if (missing.length) report.incompleteProfiles.users.push({ id: u.id, email: u.email, missing });
    });

    // --- Incomplete profiles (companies) ---
    (data.companies || []).forEach((c, i) => {
        const p = c.profile || {};
        const missing = [];
        if (!c.profile) missing.push('profile');
        else {
            if (!(p.sectors && p.sectors.length) && !(p.industry && (Array.isArray(p.industry) ? p.industry.length : p.industry))) missing.push('industry/sectors');
            if (!p.description) missing.push('description');
            if (!p.location) missing.push('location');
            if (p.financialCapacity == null) missing.push('financialCapacity');
        }
        if (missing.length) report.incompleteProfiles.companies.push({ id: c.id, email: c.email, missing });
    });

    // --- Orphans ---
    (data.applications || []).forEach(app => {
        const oppOk = opportunityIds.has(app.opportunityId);
        const appOk = allEntityIds.has(app.applicantId);
        if (!oppOk || !appOk) report.orphans.applications.push({ id: app.id, opportunityId: app.opportunityId, applicantId: app.applicantId, opportunityExists: oppOk, applicantExists: appOk });
    });
    (data.matches || []).forEach(m => {
        const candId = m.candidateId || m.userId;
        const oppOk = opportunityIds.has(m.opportunityId);
        const candOk = allEntityIds.has(candId);
        if (!oppOk || !candOk) report.orphans.matches.push({ id: m.id, opportunityId: m.opportunityId, candidateId: candId, opportunityExists: oppOk, candidateExists: candOk });
    });
    (data.notifications || []).forEach(n => {
        if (n.userId && !allEntityIds.has(n.userId)) report.orphans.notifications.push({ id: n.id, userId: n.userId });
    });
    (data.connections || []).forEach(c => {
        const fromOk = allEntityIds.has(c.fromUserId);
        const toOk = allEntityIds.has(c.toUserId);
        if (!fromOk || !toOk) report.orphans.connections.push({ id: c.id, fromUserId: c.fromUserId, toUserId: c.toUserId, fromExists: fromOk, toExists: toOk });
    });
    (data.messages || []).forEach(m => {
        const sOk = allEntityIds.has(m.senderId);
        const rOk = allEntityIds.has(m.receiverId);
        if (!sOk || !rOk) report.orphans.messages.push({ id: m.id, senderId: m.senderId, receiverId: m.receiverId });
    });
    (data.contracts || []).forEach(c => {
        const creatorOk = !c.creatorId || allEntityIds.has(c.creatorId);
        const contractorOk = !c.contractorId || allEntityIds.has(c.contractorId);
        const oppOk = !c.opportunityId || opportunityIds.has(c.opportunityId);
        if (!creatorOk || !contractorOk || !oppOk) report.orphans.contracts.push({ id: c.id, creatorId: c.creatorId, contractorId: c.contractorId, opportunityId: c.opportunityId });
    });
    (data.opportunities || []).forEach(o => {
        if (o.creatorId && !allEntityIds.has(o.creatorId)) report.orphans.opportunities.push({ id: o.id, creatorId: o.creatorId });
    });

    // --- Inconsistent sectors/categories ---
    const sectorValues = new Set();
    function collectSectors(val) {
        if (Array.isArray(val)) val.forEach(v => sectorValues.add(String(v).trim()));
        else if (val) sectorValues.add(String(val).trim());
    }
    (data.users || []).forEach(u => { const p = u.profile || {}; collectSectors(p.sectors); collectSectors(p.industry); });
    (data.companies || []).forEach(c => { const p = c.profile || {}; collectSectors(p.sectors); collectSectors(p.industry); });
    (data.opportunities || []).forEach(o => { collectSectors(o.scope && o.scope.sectors); });
    sectorValues.forEach(s => {
        if (!s) return;
        const normalized = canonicalSectors.find(c => c.toLowerCase() === s.toLowerCase());
        if (!normalized && s.length) report.inconsistentSectors.push({ value: s, suggested: canonicalSectors.find(c => c.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(c.toLowerCase())) || null });
    });

    // --- Inconsistent skills ---
    const skillValues = new Set();
    function collectSkills(val) {
        if (Array.isArray(val)) val.forEach(v => skillValues.add(String(v).trim()));
        else if (val) skillValues.add(String(val).trim());
    }
    (data.users || []).forEach(u => { const p = u.profile || {}; collectSkills(p.skills); collectSkills(p.specializations); });
    (data.companies || []).forEach(c => { const p = c.profile || {}; collectSkills(p.skills); collectSkills(p.services); });
    (data.opportunities || []).forEach(o => {
        collectSkills(o.scope && o.scope.requiredSkills);
        collectSkills(o.scope && o.scope.offeredSkills);
        collectSkills(o.attributes && o.attributes.requiredSkills);
    });
    const canonicalSkillValues = new Set(Object.values(skillSynonyms));
    skillValues.forEach(s => {
        if (!s) return;
        const key = s.toLowerCase().trim();
        const canonical = skillSynonyms[key];
        const isCanonical = canonicalSkillValues.has(s) || canonical === s;
        if (!canonical && !isCanonical) report.inconsistentSkills.push({ value: s });
    });

    // --- Inconsistent locations ---
    const locValues = new Set();
    (data.users || []).forEach(u => { if ((u.profile || {}).location) locValues.add(String((u.profile || {}).location).trim()); });
    (data.companies || []).forEach(c => { if ((c.profile || {}).location) locValues.add(String((c.profile || {}).location).trim()); });
    (data.opportunities || []).forEach(o => {
        if (o.location) locValues.add(String(o.location).trim());
        if (o.locationCountry) locValues.add(String(o.locationCountry).trim());
        if (o.locationRegion) locValues.add(String(o.locationRegion).trim());
        if (o.locationCity) locValues.add(String(o.locationCity).trim());
    });
    const locCanonicalKeys = new Set(Object.keys(locationCanonical).map(k => k.toLowerCase()));
    locValues.forEach(l => {
        if (!l) return;
        const key = l.toLowerCase().replace(/\s+/g, ' ').trim();
        const token = key.split(/[\s>,]/)[0].trim();
        if (!locationCanonical[key] && !locationCanonical[token] && !locCanonicalKeys.has(key) && !locCanonicalKeys.has(token)) report.inconsistentLocations.push({ value: l });
    });

    // --- Unused tables ---
    const hasSeed = DOMAINS.filter(d => (loadJson(`${d}.json`) || []).length >= 0);
    if (!fs.existsSync(path.join(DATA_DIR, 'subscription_plans.json'))) report.unusedTables.push({ key: 'subscription_plans', note: 'No seed file' });
    if (!fs.existsSync(path.join(DATA_DIR, 'subscriptions.json'))) report.unusedTables.push({ key: 'subscriptions', note: 'No seed file' });

    return { report, data, canonicalSectors, skillSynonyms, locationCanonical };
}

function formatSummary(report) {
    const lines = [];
    lines.push('# Data Audit Summary');
    lines.push('');
    lines.push(`Generated: ${report.timestamp}`);
    lines.push('');

    lines.push('## 1. Domain counts');
    lines.push('');
    Object.entries(report.domainCounts).forEach(([domain, count]) => { lines.push(`- **${domain}**: ${count}`); });
    lines.push('');

    lines.push('## 2. Duplicate records');
    lines.push('');
    Object.entries(report.duplicates).forEach(([domain, d]) => {
        const idDups = (d.byId || []).length;
        const emailDups = (d.byEmail || []).length;
        if (idDups || emailDups) lines.push(`- **${domain}**: ${idDups} duplicate id(s), ${emailDups} duplicate email(s)`);
        else lines.push(`- **${domain}**: None`);
    });
    lines.push('');

    lines.push('## 3. Incomplete profiles');
    lines.push('');
    lines.push('- **Users**: ' + report.incompleteProfiles.users.length + ' with missing fields');
    if (report.incompleteProfiles.users.length) report.incompleteProfiles.users.slice(0, 20).forEach(u => { lines.push(`  - ${u.id}: missing ${u.missing.join(', ')}`); });
    lines.push('- **Companies**: ' + report.incompleteProfiles.companies.length + ' with missing fields');
    if (report.incompleteProfiles.companies.length) report.incompleteProfiles.companies.forEach(c => { lines.push(`  - ${c.id}: missing ${c.missing.join(', ')}`); });
    lines.push('');

    lines.push('## 4. Orphan records');
    lines.push('');
    ['applications', 'matches', 'notifications', 'connections', 'messages', 'contracts', 'opportunities'].forEach(ent => {
        const arr = report.orphans[ent] || [];
        lines.push(`- **${ent}**: ${arr.length} orphan(s)`);
        if (arr.length && arr.length <= 15) arr.forEach(o => { lines.push(`  - ${JSON.stringify(o)}`); });
    });
    lines.push('');

    lines.push('## 5. Inconsistent category/sector names');
    lines.push('');
    lines.push('Count: ' + report.inconsistentSectors.length);
    if (report.inconsistentSectors.length) report.inconsistentSectors.slice(0, 30).forEach(s => { lines.push(`- "${s.value}"${s.suggested ? ` → suggest: ${s.suggested}` : ''}`); });
    lines.push('');

    lines.push('## 6. Inconsistent skill names');
    lines.push('');
    lines.push('Count: ' + report.inconsistentSkills.length);
    if (report.inconsistentSkills.length) report.inconsistentSkills.slice(0, 30).forEach(s => { lines.push(`- "${s.value}"`); });
    lines.push('');

    lines.push('## 7. Inconsistent location names');
    lines.push('');
    lines.push('Count: ' + report.inconsistentLocations.length);
    if (report.inconsistentLocations.length) report.inconsistentLocations.slice(0, 20).forEach(l => { lines.push(`- "${l.value}"`); });
    lines.push('');

    lines.push('## 8. Unused tables / structures');
    lines.push('');
    report.unusedTables.forEach(t => { lines.push(`- **${t.key}**: ${t.note}`); });
    lines.push('');

    return lines.join('\n');
}

function main() {
    if (!fs.existsSync(DATA_DIR)) {
        console.error('Data directory not found:', DATA_DIR);
        process.exit(1);
    }
    const { report, data } = runAudit();
    if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });
    const summaryPath = path.join(DOCS_DIR, 'DATA_AUDIT_SUMMARY.md');
    const jsonPath = path.join(DOCS_DIR, 'audit-report.json');
    fs.writeFileSync(summaryPath, formatSummary(report), 'utf8');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
    console.log('Wrote', summaryPath);
    console.log('Wrote', jsonPath);
}

main();
