/**
 * Generate graph output (Mermaid and DOT) from matching report for visualization.
 * Writes match-graph.mmd and match-graph.dot to the given base path.
 */

const fs = require('fs');
const path = require('path');

function escapeId(s) {
    return String(s).replace(/[^a-zA-Z0-9_]/g, '_');
}

function writeGraphOutput(report, basePath) {
    const dir = path.dirname(basePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const lines = [
        'flowchart LR',
        '  subgraph one_way [One-Way Matches]',
        '    direction TB',
        '    OW["One-way: ' + report.oneWayMatches + ' pairs"]',
        '  end',
        '  subgraph two_way [Two-Way Barter]',
        '    TW["Two-way: ' + report.twoWayMatches + ' pairs"]',
        '  end',
        '  subgraph group [Consortium]',
        '    GR["Group formations: ' + report.groupFormations + '"]',
        '  end',
        '  subgraph circular [Circular Exchanges]',
        '    CE["Circular: ' + report.circularExchanges + ' cycles"]',
        '  end'
    ];

    if (report.circularDetails && report.circularDetails.length > 0) {
        lines.push('  subgraph cycles [Sample Cycles]');
        report.circularDetails.slice(0, 3).forEach((c, i) => {
            const cycle = (c.cycle || []).map(escapeId).join(' --> ');
            if (cycle) lines.push('    C' + i + '["' + cycle + '"]');
        });
        lines.push('  end');
    }

    const mmd = lines.join('\n');
    fs.writeFileSync(basePath + '.mmd', mmd);

    const dotLines = [
        'digraph MatchingReport {',
        '  rankdir=LR;',
        '  subgraph cluster_one { label="One-Way"; one [label="' + report.oneWayMatches + ' matches"]; }',
        '  subgraph cluster_two { label="Two-Way Barter"; two [label="' + report.twoWayMatches + ' pairs"]; }',
        '  subgraph cluster_group { label="Consortium"; grp [label="' + report.groupFormations + ' groups"]; }',
        '  subgraph cluster_circular { label="Circular"; circ [label="' + report.circularExchanges + ' cycles"]; }'
    ];
    if (report.circularDetails && report.circularDetails.length > 0) {
        report.circularDetails.slice(0, 2).forEach((c, i) => {
            const cycle = c.cycle || [];
            for (let j = 0; j < cycle.length; j++) {
                const from = escapeId(cycle[j]);
                const to = escapeId(cycle[(j + 1) % cycle.length]);
                dotLines.push('  "' + from + '" -> "' + to + '";');
            }
        });
    }
    dotLines.push('}');
    fs.writeFileSync(basePath + '.dot', dotLines.join('\n'));
}

module.exports = { writeGraphOutput };
