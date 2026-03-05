/**
 * Admin Matching – display workflow and run matching on current platform data.
 * Uses window.dataService, window.matchingService, window.matchingModels (loaded at app init).
 */

async function initAdminMatching() {
    if (!authService.canAccessAdmin()) {
        router.navigate(CONFIG.ROUTES.DASHBOARD);
        return;
    }

    const runBtn = document.getElementById('matching-run-btn');
    const runLoading = document.getElementById('matching-run-loading');
    const reportBlock = document.getElementById('matching-report-block');
    const reportGrid = document.getElementById('matching-stats-grid');
    const reportDetails = document.getElementById('matching-report-details');
    const runError = document.getElementById('matching-run-error');

    const loadSimBtn = document.getElementById('matching-load-simulation-btn');
    const simLoading = document.getElementById('matching-simulation-loading');
    const simBlock = document.getElementById('matching-simulation-block');
    const simStats = document.getElementById('matching-simulation-stats');
    const simUnavailable = document.getElementById('matching-simulation-unavailable');

    if (runBtn) {
        runBtn.addEventListener('click', async () => {
            if (!window.matchingService || !window.matchingModels || !window.dataService) {
                if (runError) {
                    runError.hidden = false;
                    runError.textContent = 'Matching service not available. Ensure the app has loaded matching scripts.';
                }
                return;
            }
            runError.hidden = true;
            reportBlock.hidden = true;
            runLoading.hidden = false;
            runBtn.disabled = true;
            try {
                const report = await runMatchingOnCurrentData();
                renderReport(reportGrid, reportDetails, report);
                reportBlock.hidden = false;
            } catch (e) {
                runError.hidden = false;
                runError.textContent = e && e.message ? e.message : 'Run failed.';
            } finally {
                runLoading.hidden = true;
                runBtn.disabled = false;
            }
        });
    }

    if (loadSimBtn) {
        loadSimBtn.addEventListener('click', async () => {
            simBlock.hidden = true;
            simUnavailable.hidden = true;
            simLoading.hidden = false;
            try {
                const basePath = (window.CONFIG && window.CONFIG.BASE_PATH) || '';
                const res = await fetch(basePath + 'data/simulation/matching-report.json');
                if (!res.ok) throw new Error('Not found');
                const report = await res.json();
                renderSimulationReport(simStats, report);
                simBlock.hidden = false;
            } catch (e) {
                simUnavailable.hidden = false;
            } finally {
                simLoading.hidden = true;
            }
        });
    }
}

async function runMatchingOnCurrentData() {
    const dataService = window.dataService;
    const matchingService = window.matchingService;
    const matchingModels = window.matchingModels;

    const opportunities = await dataService.getOpportunities();
    const published = opportunities.filter(o => o.status === 'published');
    const needs = published.filter(o => (o.intent || 'request') === 'request');
    const offers = published.filter(o => (o.intent || '') === 'offer');

    const report = {
        totalPostsAnalyzed: published.length,
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

    const oneWayLimit = Math.min(20, needs.length);
    for (let i = 0; i < oneWayLimit; i++) {
        const need = needs[i];
        const result = await matchingService.findMatchesForPost(need.id);
        if (result.model === 'one_way' && result.matches && result.matches.length > 0) {
            report.oneWayMatches += result.matches.length;
            if (report.oneWayDetails.length < 3) {
                report.oneWayDetails.push({ needId: need.id, matchCount: result.matches.length, topScore: result.matches[0]?.matchScore });
            }
        }
    }
    report.totalMatchesFound += report.oneWayMatches;

    const barterNeeds = needs.filter(o => (o.exchangeMode || '').toLowerCase() === 'barter');
    const barterCreatorIds = new Set();
    for (const need of barterNeeds) {
        const result = await matchingService.findMatchesForPost(need.id, { model: 'two_way' });
        if (result.model === 'two_way' && result.matches && result.matches.length > 0) {
            for (const m of result.matches) {
                const key = [need.creatorId, ...(m.suggestedPartners || []).map(p => p.creatorId).sort()].join('|');
                if (!barterCreatorIds.has(key)) {
                    barterCreatorIds.add(key);
                    report.twoWayMatches++;
                }
            }
            if (report.twoWayDetails.length < 3) {
                report.twoWayDetails.push({ needId: need.id, pairCount: result.matches.length });
            }
        }
    }
    report.totalMatchesFound += report.twoWayMatches;

    const consortiumNeeds = needs.filter(n => {
        const roles = n.attributes?.memberRoles || n.attributes?.partnerRoles || [];
        return Array.isArray(roles) && roles.length > 0;
    });
    for (const need of consortiumNeeds) {
        const result = await matchingService.findMatchesForPost(need.id, { model: 'consortium' });
        if (result.model === 'consortium' && result.matches && result.matches.length > 0) {
            report.groupFormations += result.matches.length;
            if (report.groupDetails.length < 3) {
                report.groupDetails.push({ needId: need.id, roles: result.roles, partnerCount: (result.matches[0]?.suggestedPartners || []).length });
            }
        }
    }
    report.totalMatchesFound += report.groupFormations;

    const circularResult = await matchingModels.findCircularExchanges({});
    if (circularResult.model === 'circular' && circularResult.matches && circularResult.matches.length > 0) {
        report.circularExchanges = circularResult.matches.length;
        report.totalMatchesFound += report.circularExchanges;
        report.circularDetails = circularResult.matches.slice(0, 3).map(m => ({ cycle: m.cycle, score: m.matchScore }));
    }

    return report;
}

function renderReport(gridEl, detailsEl, report) {
    if (!gridEl) return;
    gridEl.innerHTML = ''
        + '<div class="stat-card"><div class="stat-value">' + report.totalPostsAnalyzed + '</div><div class="stat-label">Total posts analyzed</div></div>'
        + '<div class="stat-card"><div class="stat-value">' + report.totalMatchesFound + '</div><div class="stat-label">Total matches</div></div>'
        + '<div class="stat-card"><div class="stat-value">' + report.oneWayMatches + '</div><div class="stat-label">One-way</div></div>'
        + '<div class="stat-card"><div class="stat-value">' + report.twoWayMatches + '</div><div class="stat-label">Two-way (barter)</div></div>'
        + '<div class="stat-card"><div class="stat-value">' + report.groupFormations + '</div><div class="stat-label">Group (consortium)</div></div>'
        + '<div class="stat-card"><div class="stat-value">' + report.circularExchanges + '</div><div class="stat-label">Circular</div></div>';

    if (detailsEl) {
        let html = '';
        if (report.oneWayDetails.length) {
            html += '<p>One-way samples: ' + report.oneWayDetails.map(d => 'Need ' + d.needId + ' → ' + d.matchCount + ' matches').join('; ') + '.</p>';
        }
        if (report.twoWayDetails.length) {
            html += '<p>Two-way samples: ' + report.twoWayDetails.map(d => 'Need ' + d.needId + ' → ' + d.pairCount + ' pair(s)').join('; ') + '.</p>';
        }
        if (report.circularDetails.length) {
            html += '<p>Circular samples: ' + report.circularDetails.map(d => 'Cycle ' + (d.cycle && d.cycle.join('→')) + ' (score ' + (d.score != null ? d.score.toFixed(2) : '-') + ')').join('; ') + '.</p>';
        }
        detailsEl.innerHTML = html || '<p>No sample details.</p>';
    }
}

function renderSimulationReport(statsEl, report) {
    if (!statsEl) return;
    statsEl.innerHTML = ''
        + '<div class="stat-card"><div class="stat-value">' + (report.totalPostsAnalyzed ?? '-') + '</div><div class="stat-label">Total posts</div></div>'
        + '<div class="stat-card"><div class="stat-value">' + (report.totalMatchesFound ?? '-') + '</div><div class="stat-label">Total matches</div></div>'
        + '<div class="stat-card"><div class="stat-value">' + (report.oneWayMatches ?? '-') + '</div><div class="stat-label">One-way</div></div>'
        + '<div class="stat-card"><div class="stat-value">' + (report.twoWayMatches ?? '-') + '</div><div class="stat-label">Two-way</div></div>'
        + '<div class="stat-card"><div class="stat-value">' + (report.groupFormations ?? '-') + '</div><div class="stat-label">Group</div></div>'
        + '<div class="stat-card"><div class="stat-value">' + (report.circularExchanges ?? '-') + '</div><div class="stat-label">Circular</div></div>';
}
