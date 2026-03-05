/**
 * Add minimal opportunities so matching scenarios (one-way, barter, consortium, circular) are covered.
 * Run after validate-entities.js. Run from repo root: node POC/scripts/add-matching-data.js
 * One-way and consortium already exist (opp-001 consortium; needs and offers for one-way).
 * Adds: barter pair (two creators with mutual need/offer), circular (three creators A→B→C→A).
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const NOW = new Date().toISOString();

function loadJson(filename) {
    const filePath = path.join(DATA_DIR, filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filename, obj) {
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(obj, null, 2), 'utf8');
}

function baseOpp(creatorId, intent, title, exchangeMode, scope, options = {}) {
    return {
        id: options.id,
        title,
        description: options.description || title,
        creatorId,
        intent,
        modelType: options.modelType || 'project_based',
        subModelType: options.subModelType || 'task_based',
        status: 'published',
        location: options.location || 'Riyadh, Saudi Arabia',
        locationCountry: 'sa',
        locationRegion: 'riyadh',
        locationCity: 'riyadh-city',
        locationDistrict: '',
        latitude: 24.7136,
        longitude: 46.6753,
        exchangeMode,
        paymentModes: exchangeMode === 'barter' ? ['barter'] : ['cash'],
        scope,
        exchangeData: {
            exchangeMode,
            currency: 'SAR',
            exchangeTermsSummary: options.exchangeTermsSummary || '',
            ...(exchangeMode === 'barter' && {
                barterOffer: options.barterOffer || '',
                barterNeed: options.barterNeed || '',
                barterValue: options.barterValue || '100000'
            }),
            ...(exchangeMode === 'cash' && { cashAmount: 100000, cashPaymentTerms: 'Milestone-Based', cashMilestones: '' })
        },
        attributes: options.attributes || {},
        createdAt: NOW,
        updatedAt: NOW,
        collaborationModel: options.collaborationModel || 'project'
    };
}

function run() {
    const opportunitiesFile = loadJson('opportunities.json');
    const data = opportunitiesFile.data || [];
    const existingIds = new Set(data.map(o => o.id));
    const nextId = () => {
        let n = data.length + 1;
        while (existingIds.has(`opp-${String(n).padStart(3, '0')}`)) n++;
        const id = `opp-${String(n).padStart(3, '0')}`;
        existingIds.add(id);
        return id;
    };

    // --- Barter pair: user-pro-005 (need Engineering Consulting, offer Construction Materials) and user-pro-006 (need Construction Materials, offer Engineering Consulting) ---
    const barterSkills = { need: ['Engineering Consulting', 'Design Review'], offer: ['Construction Materials', 'Procurement'] };
    data.push(baseOpp('user-pro-005', 'request', 'Barter need: Engineering Consulting', 'barter', {
        requiredSkills: barterSkills.need,
        offeredSkills: [],
        sectors: ['Construction', 'Engineering'],
        certifications: []
    }, { id: nextId(), barterNeed: 'Engineering Consulting', barterOffer: 'Construction Materials', barterValue: '150000' }));
    data.push(baseOpp('user-pro-005', 'offer', 'Barter offer: Construction Materials', 'barter', {
        requiredSkills: [],
        offeredSkills: barterSkills.offer,
        sectors: ['Construction', 'Industrial'],
        certifications: []
    }, { id: nextId(), barterOffer: 'Construction Materials', barterNeed: 'Engineering Consulting', barterValue: '150000' }));
    data.push(baseOpp('user-pro-006', 'request', 'Barter need: Construction Materials', 'barter', {
        requiredSkills: barterSkills.offer,
        offeredSkills: [],
        sectors: ['Construction', 'Industrial'],
        certifications: []
    }, { id: nextId(), barterNeed: 'Construction Materials', barterOffer: 'Engineering Consulting', barterValue: '150000' }));
    data.push(baseOpp('user-pro-006', 'offer', 'Barter offer: Engineering Consulting', 'barter', {
        requiredSkills: [],
        offeredSkills: barterSkills.need,
        sectors: ['Construction', 'Engineering'],
        certifications: []
    }, { id: nextId(), barterOffer: 'Engineering Consulting', barterNeed: 'Construction Materials', barterValue: '150000' }));

    // --- Circular: A(002) need PM / offer Structural Analysis; B(003) need Structural Analysis / offer PM; C(004) need PM / offer Structural Analysis ---
    data.push(baseOpp('user-pro-002', 'request', 'Circular A need: Project Management', 'cash', {
        requiredSkills: ['Project Management'],
        offeredSkills: [],
        sectors: ['Construction'],
        certifications: []
    }, { id: nextId() }));
    data.push(baseOpp('user-pro-002', 'offer', 'Circular A offer: Structural Analysis', 'cash', {
        requiredSkills: [],
        offeredSkills: ['Structural Analysis', 'Structural Engineering'],
        sectors: ['Construction', 'Engineering'],
        certifications: []
    }, { id: nextId() }));
    data.push(baseOpp('user-pro-003', 'request', 'Circular B need: Structural Analysis', 'cash', {
        requiredSkills: ['Structural Analysis', 'Structural Engineering'],
        offeredSkills: [],
        sectors: ['Construction', 'Engineering'],
        certifications: []
    }, { id: nextId() }));
    data.push(baseOpp('user-pro-003', 'offer', 'Circular B offer: Project Management', 'cash', {
        requiredSkills: [],
        offeredSkills: ['Project Management', 'PMP'],
        sectors: ['Construction', 'Infrastructure'],
        certifications: []
    }, { id: nextId() }));
    data.push(baseOpp('user-pro-004', 'request', 'Circular C need: Project Management', 'cash', {
        requiredSkills: ['Project Management'],
        offeredSkills: [],
        sectors: ['Construction'],
        certifications: []
    }, { id: nextId() }));
    data.push(baseOpp('user-pro-004', 'offer', 'Circular C offer: Structural Analysis', 'cash', {
        requiredSkills: [],
        offeredSkills: ['Structural Analysis'],
        sectors: ['Construction', 'Engineering'],
        certifications: []
    }, { id: nextId() }));

    opportunitiesFile.data = data;
    if (!opportunitiesFile.version) opportunitiesFile.version = '1.2';
    saveJson('opportunities.json', opportunitiesFile);
    console.log('Added', 4 + 6, 'opportunities for barter and circular matching. Total opportunities:', data.length);
}

run();
