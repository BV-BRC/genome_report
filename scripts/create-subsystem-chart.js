#!/usr/bin/env node
/**
 *
 * create-subsystem-chart.js
 *
 * Example usage:
 *      ./create-subsystem-chart.js -i example-data/bin2.1.genome  -o reports/subsystem.svg
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
const color = require('../lib/color').category20;

let colors = {
    'Metabolism': color[0],
    'Protein Processing': color[1],
    'Stress Response, Defense, Virulence': color[2],
    'Energy': color[3],
    'DNA Processing': color[4],
    'Cellular Processes': color[5],
    'Membrane Transport': color[6],
    'RNA Processing': color[7],
    'Regulation And Cell Signaling': color[8],
    'Miscellaneous': color[9],
    'Cell Envelope': color[10],
    'Classification Node 0 (virtual)': color[11],
    '': color[12]
}


if (require.main === module){
    opts.option('-i, --input [value] Path to Genome Typed Object that contains subsystem data')
        .option('-o, --output [value] Path to write resulting subsystem chart')
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

    fsCreateChart(opts.input, opts.output);
}


async function fsCreateChart(input, output) {

    console.log('Reading genome object for subsystem data...');
    let d = await readFile(input, 'utf8');
    let data = JSON.parse(d);

    console.log('Creating pie chart...')
    let svg = await createChart(data);

    console.log('writing pie chart to file....');
    await writeFile(output, svg, 'utf8');
}


async function createChart(genomeTypedObject) {
    let subsystemSummary = genomeTypedObject.genome_quality_measure.subsystem_summary;
    let data = parseSubsystemSummary(subsystemSummary);

    let svg = pieChart({
        data,
        legendText: 'Subsystem (Subsystems, Genes)'
    });

    return svg;
}


function parseSubsystemSummary(obj) {
    let data = Object.keys(obj).map(key => {
        let o = obj[key];

        return {
            name: key + ` (${o.subsystems}, ${o.genes})`,
            value: o.subsystems,
            color: colors[key]
        }
    })

    data.sort((a, b) => b.value - a.value );

    return data;
}


module.exports = createChart;




