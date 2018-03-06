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
    annotationMeta: null,
    wiki: null,
    specialtyGenes: null
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

    // fetch all data
    let meta = await getGenomeMeta(genomeID);
    let annotationMeta = await getAnnotationMeta(genomeID);
    let wiki = await getWiki(meta[0].species, meta[0].genus);
    let specialtyGenes = await getSpecialtyGenes(genomeID);

    // build master data json
    tmplData.meta = meta[0];
    tmplData.annotationMeta = annotationMeta;
    tmplData.wiki = wiki;
    tmplData.specialtyGenes = specialtyGenes;

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


async function getWiki(species, genus) {
    let url = `${config.wikiUrl}?action=query&prop=extracts` +
        `&exintro=&format=json&formatversion=2&titles=`;

    let speciesQuery = url + species;
    console.log(`Attempting to query species on wiki...`)
    let speciesText = await rp.get(speciesQuery, getOpts).then(res => {
        let extract = res.query.pages[0].extract;
        return extract;
    }).catch((e) => {
        console.error(e.message);
    })

    // if description found, get image, return
    if (speciesText && speciesText.length != 0) {
        let imageSource = await getWikiImage(species);
        return {text: speciesText, imageSource: imageSource};
    }

    let genusQuery = url + genus;
    let genusText = await rp.get(genusQuery, getOpts).then(res => {
        let extract = res.query.pages[0].extract;
        return extract;
    }).catch((e) => {
        console.error(e.message);
    })

    if (genusText && genusText.length != 0) {
        let imageSource = await getWikiImage(genus);
        return {text: genusText, imageSource: imageSource};
    }

    return null;
}


async function getWikiImage(query) {
    let imageUrl = `${config.wikiUrl}?action=query&prop=pageimages` +
        `&format=json&formatversion=2&pithumbsize=400&titles=`;

    let queryUrl = imageUrl + query;
    let data = await rp.get(queryUrl, getOpts).then(res => {
        return res.query.pages[0].thumbnail.source;
    }).catch((e) => {
        console.error(e.message);
    })

    return data;
}



function getGenomeMeta(genomeID) {
    let url = `${config.dataAPIUrl}/genome_test/?eq(genome_id,${genomeID})&select(*)`;

    console.log(`fetching genome QC...`)
    return rp.get(url, getOpts).then(res => {
        return res;
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


function getSpecialtyGenes(genomeID) {
    let url = `${config.dataAPIUrl}/sp_gene/?eq(genome_id,${genomeID})&limit(1)`+
        `&facet((field,property_source),(mincount,1))&json(nl,map)&http_accept=application/solr+json`;

    console.log(`fetching specialty genes...`)
    return rp.get(url, getOpts).then(res => {
        let data = res.facet_counts.facet_fields.property_source;
        data = processSpecGenes(data)
        return data;
    }).catch((e) => {
        console.error(e.message);
    })
}


function processSpecGenes(data) {
    let rows = [];
    for (let key in data) {
        rows.push({
            type: key.split(':')[0],
            source: key.split(':')[1].trim(),
            genes: data[key]
        })
    }

    return rows;
}
