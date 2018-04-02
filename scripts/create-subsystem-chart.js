#!/usr/bin/env node
/**
 *
 * create-subsystem-chart.js
 *
 * Example usage:
 *      ./create-subsystem-chart.js -g 520456.3
 *
 *
 * Author(s):
 *      nconrad
*/

const fs = require('fs'),
    path = require('path'),
    process = require('process'),
    opts = require('commander'),
    rp = require('request-promise');


const config = require('../config.json');
const utils = require('./utils');
const pieChart = require('../lib/pie-chart');
const reqOpts = utils.requestOpts;


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
    let d = await utils.readFile(input, 'utf8');
    let data = JSON.parse(d);

    console.log('Creating pie chart...')
    let svg = await createChart(data);

    console.log('writing pie chart to file....');
    await utils.writeFile(output, svg, 'utf8');
}


async function createChart(genomeTypedObject) {
    let subsystemSummary = genomeTypedObject.genome_quality_measure.subsystem_summary;
    let subsystemData = parseSubsystemSummary(subsystemSummary)

    let svg = pieChart({data: subsystemData});

    return svg;
}


function parseSubsystemSummary(obj) {
    let data = Object.keys(obj).map(key => {
        let o = obj[key];

        return {
            name: key + ` (${o.subsystems}, ${o.genes})`,
            value: o.subsystems
        }
    })

    data.sort((a, b) => b.value - a.value );

    return data;
}


module.exports = createChart;




