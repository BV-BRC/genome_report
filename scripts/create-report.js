#!/usr/bin/env node
/**
 * create-report.js
 *
 *
 * Usage: create-report [options]
 *
 * Options:
 *
 *     -i, --input [value] Path of input data (Genome Typed Object)for which report will be built
 *     -o, --output [value] Path to write resulting html output
 *     -c, --circular-view [value] Path to SVG of circular view of genome
 *     -s, --color-scheme [value] Path to custom scheme for subsystem colors
 *
 *
 * Example usage:
 *
 *      ./scripts/create-report.js -i sample-data/sample.genome -o reports/test-report.html -c sample-data/myco.svg -s sample-data/myco.ss-colors
 *
 *
 * Author(s):
 *      nconrad
*/

const fs = require('fs'),
    util = require('util'),
    path = require('path'),
    process = require('process'),
    opts = require('commander'),
    handlebars = require('handlebars'),
    helpers = require('handlebars-helpers'),
    utils = require('./utils'),
    cheerio = require('cheerio');

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

const createSubsystemChart = require('./create-subsystem-chart');
const config = require('../config.json');
const templatePath = path.resolve(`${config.templatePath}`);
const referencesPath = path.resolve(`${config.referencesPath}`);

let refAnchors = true;   // probably can't use anchors with iFrames

// load template helpers
helpers.array();
helpers.number();
helpers.comparison();

utils.helpers(handlebars);


if (require.main === module){
    opts.option('-i, --input [value] Path of input data (Genome Typed Object)' +
                'for which report will be built')
        .option('-o, --output [value] Path to write resulting html output')
        .option('-c, --circular-view [value] Path to SVG of circular view of genome')
        .option('-s, --color-scheme [value] Path to custom scheme for subsystem colors')
        .parse(process.argv)


    if (!opts.input) {
        console.error("*** Must provide path '-i' to data (genome typed object)\n");
        opts.outputHelp();
        return 1;
    }

    if (!opts.output) {
        console.error("*** Must provide output path '-o' for html report\n");
        opts.outputHelp();
        return 1;
    }
    // fill html template and write html
    buildReport(opts);
}


async function buildReport(params) {
    let { input, output, circularView, colorScheme } = params;

    console.log('Loading Genome Typed Object...');
    let contents, data;
    try {
        contents = await readFile(`${input}`, 'utf8');
        gto = JSON.parse(contents);
    } catch(e) {
        console.error(`*** Could not read GTO: ${input}\n`, e)
        return 1;
    }

    console.log('Loading circular viewer svg...');
    let circularViewSVG;
    try {
        circularViewSVG = await readFile(circularView, 'utf8');
        circularViewSVG = setSVGViewbox(circularViewSVG);
    } catch (e) {
        console.error(`*** Could not read circular view file: ${circularView}\n`, e);
        circularViewSVG = "";
    }

    console.log('Creating subsystem chart...');
    let subsystemSVG = await createSubsystemChart(gto, colorScheme);

    // get all template data
    let meta = gto.genome_quality_measure;
    meta.genome_name = gto.scientific_name;
    let tmplData = {
        gto,
        meta,
        annotationMeta: getFeatureSummary(meta.feature_summary),
        pFeatures: meta.protein_summary,
        specialtyGenes: getSpecialGenes(meta.specialty_gene_summary),
        amrPhenotypes: 'classifications' in gto && getAMRPhenotypes(gto.classifications),
        amrGenes: 'amr_gene_summary' in meta && getAMRGenes(meta.amr_gene_summary),
        subsystemSVG,
        circularViewSVG,
    };


    console.log('Reading template...')
    let source;
    try {
        source = await readFile(templatePath);
    } catch(e) {
        console.error(`*** Could not read html template file: ${templatePath}\n`, e)
        return 1;
    }

    console.log('Filling template...');
    let template = handlebars.compile(source.toString());
    let content = template(tmplData);

    console.log('Adding table/figure numbers...')
    content = addTableNumbers(content);

    console.log('Adding references...')
    let assemblyMethod
    try {
        assemblyMethod = gto.job_data.assembly.attributes.chosen_assembly;
    } catch(e) {
        assemblyMethod = '';
    }
    content = await addReferences(content, assemblyMethod);

    let htmlPath = path.resolve(output);
    console.log(`Writing html to: ${htmlPath}...`);

    try {
        await writeFile(htmlPath, content);
    } catch(e) {
        console.error(`*** Could not write html file: ${htmlPath}\n`, e)
        return 1;
    }
}


function addTableNumbers(content) {
    const $ = cheerio.load(content);

    $('table-ref').each((i, elem) => { $(elem).html(`Table ${i+1}`); });
    $('table-num').each((i, elem) => { $(elem).html(`Table ${i+1}.`); });

    $('fig-ref').each((i, elem) => { $(elem).html(`Figure ${i+1}`); });
    $('fig-num').each((i, elem) => { $(elem).html(`Figure ${i+1}`); });

    return $.html();
}


async function addReferences(content, assemblyMethod) {
    // load references json file (specified in config.json)
    let refObj;
    try {
        let f = await readFile(referencesPath, 'utf8');
        refObj = JSON.parse(f);
    } catch(e) {
        console.error(`*** Could not read references file: ${referencesPath}\n`, e)
        return 1;
    }

    const $ = cheerio.load(content);

    let refCache = {}; // keep mapping of included refs

    // iterate <ref> tags, get corresponding references from the references.json
    // and replace <ref> tags with superscripts (links)
    let references = [];
    var refIdx = 1;
    $('ref').each((idx, elem) => {

        // if special assembly method citation, look up citation first
        let cites;
        if ($(elem).hasClass('assembly-method')) {
            console.log('assemblymethod', assemblyMethod)
            cites = assemblyMapping[assemblyMethod.toLowerCase()].citation;
        } else
            cites = $(elem).text().trim();


        sups = '';
        cites.split(';').forEach(ref => {
            ref = ref.trim();
            if (ref in refCache) {
                i = refCache[ref];
            } else {
                i = refIdx;
                refCache[ref] = refIdx;
            }

            let citation = refObj[ref];
            references.push(citation);

            sups +=
                `<sup class="reference">[`+
                    (refAnchors ? `<a href="#citation-${i}">${i}</a>` : [i])+
                `]</sup>`

            refIdx += 1;
        })

        $(elem).replaceWith(sups)
    });

    // create references section
    refHTML =
        `<ol class="references">` +
            references.map((r, i) => `<li id="citation-${i}">${r}</li>` ).join('') +
        `</ol>`;

    $('references').html(refHTML);

    return $.html();
}


function setSVGViewbox(content) {
    const $ = cheerio.load(content);

    $('svg').removeAttr('width');
    $('svg').removeAttr('height');
    $('svg').attr('viewbox', '0 0 3000 3000');

    return $.html();
}


function getSpecialGenes(data) {
    let groups = {}
    for (let key in data) {
        let parts = key.split(':');
        let type = parts[0],
            source = parts[1];

        let obj = {
            type: type,
            source: source.trim(),
            genes: data[key]
        }

        if (type in groups) {
            groups[type].push(obj);
        } else {
            groups[type] = [obj];
        }
    }

    // sort by sources
    for (type in groups) {
        groups[type].sort((a, b) => {
            if(a.source < b.source) return -1;
            if(a.source > b.source) return 1;
            return 0;
        });
    }

    let rows = [];
    Object.keys(groups).forEach(k => {
        rows = rows.concat(groups[k]);
    });

    // sort by type
    rows.sort((a, b) => {
        if(a.type < b.type) return -1;
        if(a.type > b.type) return 1;
        return 0;
    });

    return rows;
}


// https://github.com/olsonanl/genome_annotation/blob/master/GenomeAnnotation.spec#L242
function getFeatureSummary(obj) {
    let data = [{
        name: "CDS",
        count: obj.cds || 0,
    }, {
        name: "Partial CDS",
        count: obj.partial_cds || 0
    }, {
        name: "rRNA",
        count: obj.rRNA || 0
    }, {
        name: "tRNA",
        count: obj.tRNA || 0
    }, {
        name: "Miscellaneous RNA",
        count: obj.miscRNA || 0
    }, {
        name: "Repeat Regions",
        count: obj.repeat_region || 0
    }]


    // dsc order
    data.sort((a, b) => b.count - a.count);

    return data;
}



function getAMRPhenotypes(classifications) {
    let data = {
        resistant: [],
        susceptible: []
    };
    classifications.forEach(c => {
        if (c.sensitivity == 'resistant')
            data.resistant.push(c.name.replace(/_/g, '/'));
        else if (c.sensitivity == 'sensitive')
            data.susceptible.push(c.name.replace(/_/g, '/'));
    })

    return data;
}



/*
"amr_gene_summary" : {
    "protein altering cell wall charge conferring antibiotic resistance" : [
       "GdpD"
    ],
    "gene conferring resistance via absence" : [
       "gidB"
    ],
    "antibiotic inactivation enzyme" : [
       "ANT(6)-I"
    ],
    "antibiotic target in susceptible species" : [
       "Ddl",
       "dxr",
       "EF-G",
       "folA, Dfr",
       "folP",
       "gyrA",
       "gyrB",
       "inhA, fabI",
       "Iso-tRNA",
       "kasA",
       "MurA",
       "parC",
       "parE/parY",
       "rho",
       "rpoB",
       "rpoC",
       "S10p",
       "S12p"
    ],
    "regulator modulating expression of antibiotic resistance genes" : [
       "OxyR"
    ]
 },
 */
function getAMRGenes(geneSummary) {
    let data = Object.keys(geneSummary).map(key => {
        return {
            label: key.charAt(0).toUpperCase() + key.slice(1),
            vals: geneSummary[key]
        }
    })

    data.sort((a, b) => {
        if(a.label < b.label) return -1;
        if(a.label > b.label) return 1;
        return 0;
    })

    return data;
}



let assemblyMapping = {
    spades: {
        label: 'SPAdes',
        citation: 'Bankevich, et al. 2012'
    },
    velvet: {
        label: 'Velvet',
        citation: 'Zerbino and Birney 2008'
    },
    idba: {
        label: 'IDBA',
        citation: 'Peng, et al. 2010',
    },
    megahit: {
        label: 'MEAGHIT',
        citation: 'Li, et al. 2015'
    },
    plasmidspades: {
        label: 'plasmidSPADES',
        citation: 'Antipov, et al. 2016'
    },
    miniasm: {
        label: 'Miniasm',
        citation: 'Li 2016'
    },
    '': {citation: ''}
}


module.exports = buildReport;

