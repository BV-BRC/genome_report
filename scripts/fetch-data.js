#!/usr/bin/env node
/**
 *
 * fetch-data.js
 *
 * Example usage:
 *      ./fetch-data.js --genome_id=83332.12
 *
 *      ./fetch-data.js --genome_id=520456.3
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

const utils = require('./utils');
const config = require('../config.json');


const getOpts = {
    json: true,
    headers: {
      "content-type": "application/json",
      "authorization": opts.token || ''
    }
}


const tmplData = {
    meta: null,
    annotationData: null
}


if (require.main === module){
    opts.option('-g, --genome_id [value]', 'Genome ID to fetch data for.')
        .parse(process.argv)

    if (!opts.genome_id) {
        console.error("\nMust provide a genome ID.\n");
        process.exit(1);
    }

    let genomeID = opts.genome_id;

    getAllData(genomeID);
}


// # contigs, genome length, gc, n50, L50, genome coverage
async function getAllData(genomeID) {
    // fetching meta
    let meta = await getMeta(genomeID);
    let annotationMeta = await getAnnotationMeta(genomeID);

    // build master data json
    tmplData.meta = meta;
    tmplData.annotationMeta = annotationMeta;


    // create genome folder if needed
    utils.createGenomeDir(genomeID);

    // write output
    let outPath = path.resolve(`../${config.reportDir}/${genomeID}/${genomeID}-data.json`);
    console.log(`writing ${outPath}...`);
    let jsonStr = JSON.stringify(tmplData, null, 4);
    await utils.writeFile(outPath, jsonStr);

    console.log(`Done.`);
    process.exit();
}



function getMeta(genomeID) {
    let url = `${config.dataAPIUrl}/genome/${genomeID}`;

    console.log(`fetching genome meta...`)
    return rp.get(url, getOpts).then(meta => {
            return meta;
        }).catch((e) => {
            console.error(e.message);
        })
}


function getAnnotationMeta(genomeID) {
    let url = `${config.dataAPIUrl}/genome_feature/?eq(genome_id,${genomeID})&limit(1)`+
        `&in(annotation,(PATRIC,RefSeq))&ne(feature_type,source)`+
        `&facet((pivot,(annotation,feature_type)),(mincount,0))&http_accept=application/solr+json`;

    console.log(`fetching anotation meta...`)
    return rp.get(url, getOpts).then(res => {
        let d = res.facet_counts.facet_pivot['annotation,feature_type'][0].pivot;

        let data  = d.map(o => {
            return {
                name: o.value,
                count: o.count
            }
        })

        return data;
    }).catch((e) => {
        console.error(e.message);
    })
}


