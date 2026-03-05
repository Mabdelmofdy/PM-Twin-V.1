/**
 * Validate and fill missing required fields on users, companies, opportunities.
 * Run after consolidate-data.js. Run from repo root: node POC/scripts/validate-entities.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const VALID_SECTORS = ['Construction', 'Infrastructure', 'Technology', 'Energy', 'Manufacturing', 'Real Estate', 'Transportation', 'Architecture', 'Engineering', 'Hospitality', 'Industrial', 'Agriculture', 'Education', 'Legal Services', 'Building', 'Commercial', 'Utilities', 'Oil and Gas'];

const COLLAB_MAP = {
    project_based_task_based: 'project',
    project_based_consortium: 'consortium',
    project_based_project_jv: 'project',
    project_based_spv: 'project',
    strategic_partnership_strategic_jv: 'advisory',
    strategic_partnership_strategic_alliance: 'advisory',
    strategic_partnership_mentorship: 'advisory',
    resource_pooling_bulk_purchasing: 'service',
    resource_pooling_equipment_sharing: 'service',
    resource_pooling_resource_sharing: 'service',
    hiring_professional_hiring: 'service',
    hiring_consultant_hiring: 'service',
    competition_competition_rfp: 'project'
};

function loadJson(filename) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filename, obj) {
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(obj, null, 2), 'utf8');
}

function arr(v) {
    return Array.isArray(v) ? v : (v ? [v] : []);
}

function run() {
    let changes = { users: 0, companies: 0, opportunities: 0 };

    const usersFile = loadJson('users.json');
    if (usersFile && usersFile.data) {
        usersFile.data.forEach(u => {
            if (!u.profile) return;
            const p = u.profile;
            if (u.role === 'admin') {
                if (!p.location) { p.location = 'Riyadh'; changes.users++; }
                if (!p.skills || !Array.isArray(p.skills)) { p.skills = []; changes.users++; }
                if (!p.specializations || !p.specializations.length) { p.specializations = ['Platform Administration']; changes.users++; }
                if (p.yearsExperience == null) { p.yearsExperience = 0; changes.users++; }
                if (!p.preferredPaymentModes || !p.preferredPaymentModes.length) { p.preferredPaymentModes = ['cash']; changes.users++; }
            } else {
                if (p.yearsExperience == null && p.experience != null) { p.yearsExperience = p.experience; changes.users++; }
                if (!p.specializations && p.skills && p.skills.length) { p.specializations = p.skills.slice(0, 3); changes.users++; }
                if (!p.sectors && p.interests && p.interests.length) {
                    const derived = p.interests.filter(i =>
                        VALID_SECTORS.some(s => s.toLowerCase().includes((i || '').toLowerCase()) || (i || '').toLowerCase().includes(s.toLowerCase()))
                    );
                    if (derived.length) { p.sectors = derived; changes.users++; }
                }
                if (!p.preferredPaymentModes || !p.preferredPaymentModes.length) { p.preferredPaymentModes = ['cash']; changes.users++; }
            }
        });
        saveJson('users.json', usersFile);
    }

    const companiesFile = loadJson('companies.json');
    if (companiesFile && companiesFile.data) {
        companiesFile.data.forEach(c => {
            if (!c.profile) return;
            const p = c.profile;
            if (!p.industry && p.sectors && p.sectors.length) { p.industry = [...p.sectors]; changes.companies++; }
            if (!p.preferredPaymentModes || !p.preferredPaymentModes.length) { p.preferredPaymentModes = ['cash']; changes.companies++; }
            if (p.financialCapacity == null) {
                const t = (p.companyType || '').toLowerCase();
                p.financialCapacity = t.includes('large') ? 100000000 : t.includes('medium') ? 25000000 : 5000000;
                changes.companies++;
            }
        });
        saveJson('companies.json', companiesFile);
    }

    const opportunitiesFile = loadJson('opportunities.json');
    if (opportunitiesFile && opportunitiesFile.data) {
        opportunitiesFile.data.forEach(o => {
            if (o.intent === undefined) { o.intent = 'request'; changes.opportunities++; }
            if (o.collaborationModel === undefined) {
                const key = `${o.modelType || ''}_${o.subModelType || ''}`;
                o.collaborationModel = COLLAB_MAP[key] || 'project';
                changes.opportunities++;
            }
            if (!o.paymentModes || !Array.isArray(o.paymentModes)) {
                o.paymentModes = [o.exchangeMode || 'cash'];
                changes.opportunities++;
            }
            const attrs = o.attributes || {};
            const hasScope = o.scope && typeof o.scope === 'object' && (
                (Array.isArray(o.scope.requiredSkills) && o.scope.requiredSkills.length > 0) ||
                (Array.isArray(o.scope.sectors) && o.scope.sectors.length > 0) ||
                (Array.isArray(o.scope.certifications) && o.scope.certifications.length > 0) ||
                (Array.isArray(o.scope.offeredSkills) && o.scope.offeredSkills.length > 0)
            );
            if (!hasScope) {
                o.scope = {
                    requiredSkills: arr(attrs.requiredSkills),
                    offeredSkills: arr(attrs.offeredSkills),
                    sectors: arr(attrs.sectors),
                    certifications: arr(attrs.certifications),
                    interests: arr(attrs.interests)
                };
                changes.opportunities++;
            }
        });
        saveJson('opportunities.json', opportunitiesFile);
    }

    return changes;
}

const changes = run();
console.log('Validate/fill complete. Changes:', changes);
