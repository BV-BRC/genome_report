#!/usr/bin/env node
/**
 * genome-report.js
 * Main script to create svgs, fetch data, and produce report.
 *
 * Example usage:
 *      ./run-all.js --g 520456.3
 *
 * Authors:
 *      nconrad
 *
*/
const opts = require('commander');

const subsysChart = require('./create-subsystem-chart');
const fetchData = require('./fetch-data');
const createReport = require('./create-report');


if (require.main === module){
    opts.option('-i, --input [value] Path of input data (Genome Typed Object)\n\t\t\t ' +
                'for which report will be built')
        .option('-o, --output [value] Path to directory to write html and svgs')
        .option('-s, --subsystem_svg [value] Path to subsystem svg to include (optional)')
        .parse(process.argv)


    if (!opts.input) {
        console.error("\nMust provide path '-i' to data (genome typed object)\n");
        opts.outputHelp();
        return 1;
    }

    if (!opts.output) {
        console.error("\nMust provide output path '-o' for html report\n");
        opts.outputHelp();
        return 1;
    }

    if (!opts.subsystem_svg) {
        console.warning("\nWARNING: Path to subsystem svg was not provided\n");
    }

    genomeReport(opts.input, opts.output, opts.subsystem_svg);
}


async function genomeReport(input, output) {
    await subsysChart(genomeID, token);
    console.log('created subsystem svg.')

    await fetchData(genomeID, token);
    await createReport(genomeID);

    console.log('done.')
    return;
}

