#!/usr/bin/env node
/**
 *
 * create-report.js
 *
 * Example usage:
 *      ./scripts/create-report.js -i sample.genome -o reports/test-report.html
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


// load template helpers
helpers.array();
helpers.number();
helpers.comparison();


utils.helpers(handlebars);



// template data to be used
const tmplData = {
    reportDate: new Date().toJSON().slice(0,10).replace(/-/g,'/')
}


if (require.main === module){
    opts.option('-i, --input [value] Path of input data (Genome Typed Object)\n\t\t\t ' +
                'for which report will be built')
        .option('-o, --output [value] Path to write resulting html output')
	.option('-c, --circular-view [value] Path to SVG of circular view of genome')
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
    // fill html template and write html
    buildReport(opts.input, opts.output, opts.circularView);
}


async function buildReport(input, output, circularView) {

    console.log('Loading Genome Typed Object...');
    let contents, data;
    try {
        contents = await readFile(`${input}`, 'utf8');
        gto = JSON.parse(contents);
    } catch(e) {
        console.error('\x1b[31m', '\nCould not read GTO!\n', '\x1b[0m', e)
        return 1;
    }

    let circularViewSVG;
    try {
	circularViewSVG = await readFile(circularView, 'utf8');
    } catch (e) {
	console.error('\x1b[31m', `\nCould not read circular view file ${circularView}\n`, '\x1b[0m', e);
	circularViewSVG = "";
    }

    console.log('Creating subsystem chart...');
    let subsystemSVG = await createSubsystemChart(gto);

    // merge in report data
    let meta = gto.genome_quality_measure;
    meta.genome_name = gto.scientific_name;
    Object.assign(tmplData, {
        gto,
        meta,
        annotationMeta: getFeatureSummary(meta.feature_summary),
        proteinFeatures: getProteinFeatures(meta.protein_summary),
        specialtyGenes: getSpecialGenes(meta.specialty_gene_summary),
        amr: 'classifications' in gto && getAMRPhenotypes(gto.classifications),
	subsystemSVG,
	circularViewSVG,
    });


    console.log('Reading template...')
    let source;
    try {
        source = await readFile(templatePath);
    } catch(e) {
        console.error('\x1b[31m', '\nCould not read html template file!\n', '\x1b[0m', e)
        return 1;
    }

    console.log('Filling template...');
    let template = handlebars.compile(source.toString());
    let content = template(tmplData);

    console.log('Adding table/figure numbers...')
    content = addTableNumbers(content);

    let htmlPath = path.resolve(output);
    console.log(`Writing html to: ${htmlPath}...`);

    try {
        await writeFile(htmlPath, content);
    } catch(e) {
        console.error('\x1b[31m', '\nCould not write html file!\n', '\x1b[0m', e)
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
        count: obj.cds,
    }, {
        name: "Partial CDS",
        count: obj.partial_cds
    }, {
        name: "rRNA",
        count: obj.rRNA
    }, {
        name: "tRNA",
        count: obj.tRNA
    }, {
        name: "Miscellaneous RNA",
        count: obj.miscRNA
    }, {
        name: "Repeat Regions",
        count: obj.repeat_region
    }]


    // dsc order
    data.sort((a, b) => b.count - a.count);

    return data;
}

function getProteinFeatures(obj) {
    let data = [{
        name: "Hypothetical proteins",
        count: obj.hypothetical
    }, {
        name: "Proteins with functional assignments",
        count: obj.function_assignment,
    }, {
        name: "Proteins with EC number assignments",
        count: obj.ec_assignment
    }, {
        name: "Proteins with GO assignments",
        count: obj.go_assignment
    }, {
        name: "Proteins with Pathway assignments",
        count: obj.pathway_assignment
    }, {
        name: "Proteins with PATRIC genus-specific family (PLfam) assignments",
        count: obj.plfam_assignment
    }, {
        name: "Proteins with PATRIC cross-genus family (PGfam) assignments",
        count: obj.pgfam_assignment
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



module.exports = buildReport;

