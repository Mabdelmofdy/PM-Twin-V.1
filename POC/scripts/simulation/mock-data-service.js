/**
 * Mock Data Service for matching simulation in Node.
 * Loads POC/data/simulation/*.json and optional skill-canonical.json;
 * exposes getOpportunityById, getOpportunities, getUsers, getCompanies.
 */

const fs = require('fs');
const path = require('path');

const POC_ROOT = path.join(__dirname, '..', '..');
const SIM_DATA = path.join(POC_ROOT, 'data', 'simulation');
const CANONICAL_PATH = path.join(POC_ROOT, 'data', 'skill-canonical.json');

function loadJson(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
}

function createMockDataService(options = {}) {
    const useSimulation = options.simulationDir !== false;
    const dir = options.simulationDir || SIM_DATA;

    let companies = [];
    let users = [];
    let opportunities = [];

    if (useSimulation && fs.existsSync(dir)) {
        const companiesFile = path.join(dir, 'companies.json');
        const usersFile = path.join(dir, 'users.json');
        const opportunitiesFile = path.join(dir, 'opportunities.json');
        if (fs.existsSync(companiesFile)) {
            const data = loadJson(companiesFile);
            companies = data.data || [];
        }
        if (fs.existsSync(usersFile)) {
            const data = loadJson(usersFile);
            users = data.data || [];
        }
        if (fs.existsSync(opportunitiesFile)) {
            const data = loadJson(opportunitiesFile);
            opportunities = data.data || [];
        }
    }

    const publishedOnly = options.publishedOnly !== false;
    const allOpportunities = publishedOnly
        ? opportunities.filter(o => o.status === 'published')
        : opportunities;

    return {
        async getOpportunityById(id) {
            return allOpportunities.find(o => o.id === id) || null;
        },
        async getOpportunities() {
            return [...allOpportunities];
        },
        async getUsers() {
            return [...users];
        },
        async getCompanies() {
            return [...companies];
        }
    };
}

function loadSkillCanonicalForNode() {
    if (fs.existsSync(CANONICAL_PATH)) {
        return loadJson(CANONICAL_PATH);
    }
    return { skillSynonyms: {}, locationCanonical: {}, categoryExpansion: {} };
}

module.exports = { createMockDataService, loadSkillCanonicalForNode, CANONICAL_PATH, SIM_DATA };
