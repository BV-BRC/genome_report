#!/usr/bin/env node
/**
 *
 * create-subsystem-chart.js
 *
 * Example usage:
 *      ./create-subsystem-chart.js -i sample-data/bin2.1.genome  -o reports/subsystem.svg
 *
 *
 * Author(s):
 *      nconrad
*/

const fs = require('fs'),
    util = require('util'),
    path = require('path'),
    process = require('process'),
    opts = require('commander');

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

const config = require('../config.json');
const pieChart = require('../lib/pie-chart');

const colors = {
    "Cellular Processes" : "#7f7f7f",
    "Protein Processing" : "#1f77b4",
    "Miscellaneous" : "#bcbd22",
    "Membrane Transport" : "#e377c2",
    "Metabolism" : "#ff7f0e",
    "Cell Envelope" : "#aec7e8",
    "Regulation And Cell Signaling" : "#17becf",
    "RNA Processing" : "#9467bd",
    "Stress Response, Defense, Virulence" : "#2ca02c",
    "DNA Processing" : "#8c564b",
    "Energy" : "#d62728"
 }


if (require.main === module){
    opts.option('-i, --input [value] Path to Genome Typed Object that contains subsystem data')
        .option('-o, --output [value] Path to write resulting subsystem chart')
        .option('-s, --color-scheme [value] Path to custom scheme for subsystem colors')
        .parse(process.argv)

    if (!opts.input) {
        console.error("\nMust provide path '-i' to data (genome typed object)\n");
        opts.outputHelp();
        return 1;
    }

    if (!opts.output) {
        console.error("\nMust provide output path '-o' for subsystem SVG\n");
        opts.outputHelp();
        return 1;
    }

    fsCreateChart(opts);
}


async function fsCreateChart(opts) {
    let { input, output, colorScheme } = opts;

    console.log('Reading genome object for subsystem data...');
    let d = await readFile(input, 'utf8');
    let data = JSON.parse(d);

    console.log('Creating pie chart...')
    let svg = await createChart(data, colorScheme);

    console.log('writing pie chart to file....');
    await writeFile(output, svg, 'utf8');
}


async function createChart(genomeTypedObject, colorsPath) {
    let colorObj;
    if (colorsPath) {
        try {
            let d = await readFile(colorsPath);
            colorObj = JSON.parse(d);
        } catch(e) {
            console.error('\x1b[31m', '\nCould not read color scheme file!\n', '\x1b[0m', e)
            return 1;
        }
    } else {
        console.log('WARNING: using default colors!')
        colorObj = colors;
    }

    let subsystemSummary = genomeTypedObject.genome_quality_measure.subsystem_summary;
    let data = parseSubsystemSummary(subsystemSummary, colorObj);

    let svg = pieChart({
        data,
        legendText: 'Subsystem (Subsystems, Genes)'
    });

    return svg;
}


function parseSubsystemSummary(obj, colorObj) {
    let data = Object.keys(obj).map(key => {
        let o = obj[key];

        return {
            name: key + ` (${o.subsystems}, ${o.genes})`,
            value: o.subsystems,
            color: colorObj[key]
        }
    })

    data.sort((a, b) => b.value - a.value );

    return data;
}


module.exports = createChart;




