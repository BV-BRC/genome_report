#!/usr/bin/env node
/**
 *
 * genome-report.js
 *
 * Example usage:
 *      ./generate-report.js --genome_id=520456.3
 *
 * Authors:
 *      nconrad
 *
*/
const opts = require('commander');

const fetchImages = require('./fetch-images');
const fetchData = require('./fetch-data');
const createReport = require('./create-report');


if (require.main === module){
    opts.option('-g, --genome_id [value]', 'Genome ID to create images for.')
        .parse(process.argv);

    if (!opts.genome_id) {
        console.error("\nMust provide a genome ID.\n");
        process.exit(1);
    }

    genomeReport(opts.genome_id);
}


async function genomeReport(genomeID) {
    await fetchImages(genomeID);
    await fetchData(genomeID);
    await createReport(genomeID);

    console.log('Done.')
    return;
}

