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
const pieChart = require('../lib/pie-chart')
const reqOpts = utils.requestOpts;


if (require.main === module){
    opts.option('-g, --genome_id [value]', 'Genome ID to fetch data for.')
        .option('-t, --token [value]', 'Auth token (for private data)')
        .parse(process.argv)

    if (!opts.genome_id) {
        console.error("\nMust provide a genome ID.\n");
        process.exit(1);
    }

    let genomeID = opts.genome_id;
    createChart(genomeID, opts.token);
}


async function createChart(genomeID, token) {
    reqOpts.headers.authorization = token;

    console.log('fetching subsystem data')
    let data = await getSubsystemData(genomeID);

    console.log('creating pie chart...');
    let svg = pieChart(data);

    let genomeDir = utils.createGenomeDir(genomeID);

    console.log('writing pie chart to file....');
    await utils.writeFile(`${genomeDir}/${genomeID}-subsystem.svg`, svg, 'utf8');
}


function getSubsystemData(genomeID) {

    var json = {
        "stat": {
            "type": "field",
            "field": "superclass",
            "limit": -1,
            "facet": {
                "subsystem_count": "unique(subsystem_id)",
                "class": {
                    "type": "field",
                    "field": "class",
                    "limit": -1,
                    "facet": {
                        "subsystem_count": "unique(subsystem_id)",
                        "gene_count": "unique(feature_id)",
                        "subclass": {
                            "type": "field",
                            "field": "subclass",
                            "limit": -1,
                            "facet": {
                                "subsystem_count": "unique(subsystem_id)",
                                "gene_count": "unique(feature_id)"
                            }
                        }
                    }
                }
            }
        }
    }

    // to be replaced
    let url = `${config.dataAPIUrl}/subsystem/` +
        `?eq(genome_id,520456.3)&group((field,subsystem_id),(format,simple),(ngroups,true),(limit,1),(facet,true))`+
        `&json(facet,%7B%22stat%22%3A%7B%22type%22%3A%22field%22%2C%22field%22%3A%22superclass`+
        `%22%2C%22limit%22%3A-1%2C%22facet%22%3A%7B%22subsystem_count%22%3A%22unique(subsystem_id)`+
        `%22%2C%22class%22%3A%7B%22type%22%3A%22field%22%2C%22field%22%3A%22class%22%2C%22limit`+
        `%22%3A-1%2C%22facet%22%3A%7B%22subsystem_count%22%3A%22unique(subsystem_id)%22%2C%22gene_count`+
        `%22%3A%22unique(feature_id)%22%2C%22subclass%22%3A%7B%22type%22%3A%22field%22%2C%22field%22%3A%22`+
        `subclass%22%2C%22limit%22%3A-1%2C%22facet%22%3A%7B%22subsystem_count%22%3A%22unique(subsystem_id)`+
        `%22%2C%22gene_count%22%3A%22unique(feature_id)%22%7D%7D%7D%7D%7D%7D%7D)`+
        `&http_accept=application/solr+json`;


    console.log(`fetching subsystem data...`)
    return rp.get(url, reqOpts).then(res => {
        let buckets = res.facets.stat.buckets;

        let data = buckets.map(b => {
            return {
                name: b.val,
                value: b.count
            }
        })

        return data;
    }).catch((e) => {
        console.error(e.message);
    })
}


module.exports = createChart;




