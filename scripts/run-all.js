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
    opts.option('-g, --genome_id [value]', 'Genome ID to create images for.')
        .option('-t, --token [value]', 'Auth token (for private data)')
        .option('-p, --include_pdf [value]', 'option to also include PDF output')
        .parse(process.argv);

    if (!opts.genome_id) {
        console.error("\nMust provide a genome ID.\n");
        process.exit(1);
    }

    genomeReport(opts.genome_id, opts.token, opts.include_pdf);
}


async function genomeReport(genomeID, token, includePDF) {
    await subsysChart(genomeID, token);
    console.log('created subsystem svg.')

    await fetchData(genomeID, token);
    await createReport(genomeID, includePDF);

    console.log('done.')
    return;
}

