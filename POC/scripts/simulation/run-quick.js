/**
 * Quick simulation run with small limits for CI / quick validation.
 */
const path = require('path');
const { runSimulation, writeReport, OUT_DIR } = require('./run-matching-simulation.js');
const SIM_DIR = path.join(__dirname, '..', '..', 'data', 'simulation');

runSimulation({
    simulationDir: SIM_DIR,
    oneWayLimit: 3,
    barterLimit: 2,
    verbose: true
})
    .then(report => {
        writeReport(report, { outDir: SIM_DIR });
        console.log('Quick run done.');
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
