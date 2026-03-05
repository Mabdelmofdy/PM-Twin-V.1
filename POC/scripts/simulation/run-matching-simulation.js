/**
 * Run matching simulation: run all four models on seeded data and collect counts.
 * Writes matching-report.json and matching-report.txt to POC/data/simulation/.
 *
 * Usage: node scripts/simulation/run-matching-simulation.js [--debug] [--visualize]
 */

const path = require('path');
const fs = require('fs');
const { bootstrap } = require('./bootstrap-matching.js');

const OUT_DIR = path.join(__dirname, '..', '..', 'data', 'simulation');

async function runSimulation(options = {}) {
    if (options.verbose) console.log('Bootstrapping...');
    const { matchingService, matchingModels, dataService } = bootstrap({
        debug: options.debug,
        simulationDir: options.simulationDir
    });

    if (options.verbose) console.log('Loading opportunities...');
    const opportunities = await dataService.getOpportunities();
    const needs = opportunities.filter(o => (o.intent || 'request') === 'request');
    const offers = opportunities.filter(o => (o.intent || '') === 'offer');

    const report = {
        totalPostsAnalyzed: opportunities.length,
        totalNeeds: needs.length,
        totalOffers: offers.length,
        oneWayMatches: 0,
        twoWayMatches: 0,
        groupFormations: 0,
        circularExchanges: 0,
        totalMatchesFound: 0,
        oneWayDetails: [],
        twoWayDetails: [],
        groupDetails: [],
        circularDetails: []
    };

    // 1) One-way: each Need post (cap at 10 by default for speed; set options.oneWayLimit for full run)
    const oneWayLimit = options.oneWayLimit != null ? options.oneWayLimit : Math.min(10, needs.length);
    if (options.verbose) console.log('Running one-way (' + oneWayLimit + ' needs)...');
    for (let i = 0; i < Math.min(needs.length, oneWayLimit); i++) {
        const need = needs[i];
        const result = await matchingService.findMatchesForPost(need.id);
        if (result.model === 'one_way' && result.matches && result.matches.length > 0) {
            report.oneWayMatches += result.matches.length;
            if (report.oneWayDetails.length < 5) {
                report.oneWayDetails.push({ needId: need.id, matchCount: result.matches.length, topScore: result.matches[0]?.matchScore });
            }
        }
    }
    report.totalMatchesFound += report.oneWayMatches;

    // 2) Two-way: barter (call once per barter creator to avoid double count; use need posts with exchangeMode barter)
    const barterNeeds = needs.filter(o => (o.exchangeMode || '').toLowerCase() === 'barter');
    const barterLimit = options.barterLimit != null ? options.barterLimit : barterNeeds.length;
    if (options.verbose) console.log('Running two-way barter (' + Math.min(barterNeeds.length, barterLimit) + ' needs)...');
    const barterCreatorIds = new Set();
    for (let bi = 0; bi < Math.min(barterNeeds.length, barterLimit); bi++) {
        const need = barterNeeds[bi];
        const result = await matchingService.findMatchesForPost(need.id, { model: 'two_way' });
        if (result.model === 'two_way' && result.matches && result.matches.length > 0) {
            for (const m of result.matches) {
                const key = [need.creatorId, ...(m.suggestedPartners || []).map(p => p.creatorId).sort()].join('|');
                if (!barterCreatorIds.has(key)) {
                    barterCreatorIds.add(key);
                    report.twoWayMatches++;
                }
            }
            if (report.twoWayDetails.length < 5) {
                report.twoWayDetails.push({ needId: need.id, pairCount: result.matches.length });
            }
        }
    }
    report.totalMatchesFound += report.twoWayMatches;

    // 3) Consortium: needs with memberRoles
    if (options.verbose) console.log('Running consortium...');
    const consortiumNeeds = needs.filter(n => {
        const roles = n.attributes?.memberRoles || n.attributes?.partnerRoles || [];
        return Array.isArray(roles) && roles.length > 0;
    });
    for (const need of consortiumNeeds) {
        const result = await matchingService.findMatchesForPost(need.id, { model: 'consortium' });
        if (result.model === 'consortium' && result.matches && result.matches.length > 0) {
            report.groupFormations += result.matches.length;
            if (report.groupDetails.length < 5) {
                report.groupDetails.push({ needId: need.id, roles: result.roles, partnerCount: (result.matches[0]?.suggestedPartners || []).length });
            }
        }
    }
    report.totalMatchesFound += report.groupFormations;

    // 4) Circular
    if (options.verbose) console.log('Running circular exchange...');
    const circularResult = await matchingModels.findCircularExchanges({});
    if (circularResult.model === 'circular' && circularResult.matches && circularResult.matches.length > 0) {
        report.circularExchanges = circularResult.matches.length;
        report.totalMatchesFound += report.circularExchanges;
        report.circularDetails = circularResult.matches.slice(0, 5).map(m => ({ cycle: m.cycle, score: m.matchScore }));
    }

    return report;
}

function writeReport(report, options = {}) {
    const outDir = options.outDir || OUT_DIR;
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const jsonPath = path.join(outDir, 'matching-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    const lines = [
        'Matching Simulation Report',
        '==========================',
        `Total posts analyzed: ${report.totalPostsAnalyzed}`,
        `Total matches found: ${report.totalMatchesFound}`,
        '',
        'Breakdown:',
        `  One-way matches: ${report.oneWayMatches}`,
        `  Two-way (barter) matches: ${report.twoWayMatches}`,
        `  Group (consortium) formations: ${report.groupFormations}`,
        `  Circular exchanges: ${report.circularExchanges}`
    ];
    const txtPath = path.join(outDir, 'matching-report.txt');
    fs.writeFileSync(txtPath, lines.join('\n'));

    console.log(lines.join('\n'));
    console.log('\nReport written to', jsonPath, 'and', txtPath);
}

module.exports = { runSimulation, writeReport, OUT_DIR };

const args = process.argv.slice(2);
const debug = args.includes('--debug');
const visualize = args.includes('--visualize');

if (require.main === module) {
    const verbose = args.includes('--verbose');
    runSimulation({ debug, verbose })
    .then(report => {
        writeReport(report);
        if (visualize) {
            try {
                const { writeGraphOutput } = require('./report-graph.js');
                writeGraphOutput(report, path.join(OUT_DIR, 'match-graph'));
            } catch (e) {
                console.warn('Visualization skipped:', e.message);
            }
        }
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
}
