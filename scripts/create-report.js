#!/usr/bin/env node
/**
 *
 * create-report.js
 *
 * Example usage:
 *      ./create-report.js --genome_id=520456.3
 *
 * Author(s):
 *      nconrad
*/

const fs = require('fs'),
    path = require('path'),
    process = require('process'),
    opts = require('commander'),
    rp = require('request-promise'),
    mustache = require('mustache'),
    utils = require('./utils'),
    cheerio = require('cheerio');

const puppeteer = require('puppeteer');

const config = require('../config.json');
const templatePath = path.resolve(`${config.templatePath}`);
const pdfMargin = '35px';

const tmplData = {
    author: {
        name: 'nconrad'
    },
    reportDate: new Date().toJSON().slice(0,10).replace(/-/g,'/'),
    getTaxonomy: function() {
        let taxonLineage = this.meta.taxon_lineage_names;
        return taxonLineage.slice(1).join('; ')
    }
}


if (require.main === module){
    opts.option('-g, --genome_id [value]', 'Genome ID to create report for.')
        .parse(process.argv)

    if (!opts.genome_id) {
        console.error("\nMust provide a genome ID.\n");
        process.exit(1);
    }

    let genomeID = opts.genome_id;

    // fill html template and save as pdf
    buildPdf(genomeID);
}


async function buildPdf(genomeID) {
    let genomeDir = utils.createGenomeDir(genomeID);
    let d = await utils.readFile(`${genomeDir}/${genomeID}-data.json`, 'utf8');
    let reportData = JSON.parse(d);

    // merge in report data
    Object.assign(tmplData, reportData);

    console.log('Reading template...')
    fs.readFile(templatePath, (err, data) => {
        if (err) throw err;

        console.log('Filling template...');
        let content = mustache.render(data.toString(), tmplData);

        console.log('Adding table/figure numbers...')
        content = addTableNumbers(content);

        let htmlPath = path.resolve(`${genomeDir}/genome-report.html`);
        console.log(`Writing html to ${htmlPath}...`);
        fs.writeFileSync(htmlPath, content);

        let pdfPath = path.resolve(`${genomeDir}/genome-report.pdf`);
        generatePdf(htmlPath, pdfPath);
    });
}



function addTableNumbers(content) {
    const $ = cheerio.load(content);

    $('table-ref').each((i, elem) => { $(elem).html(`Table ${i+1}`); });
    $('table-num').each((i, elem) => { $(elem).html(`Table ${i+1}.`); });

    $('fig-ref').each((i, elem) => { $(elem).html(`Figure ${i+1}`); });
    $('fig-num').each((i, elem) => { $(elem).html(`Figure ${i+1}`); });

    return $.html();
}


async function generatePdf(htmlPath, outPath) {
    let browser = await puppeteer.launch({ headless: true } );
    let page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, {waitUntil: 'networkidle2'});

    console.log(`Generating pdf ${outPath}...`)
    await page.pdf({path: outPath, format: 'letter',
        margin: {
            top: pdfMargin,
            left: pdfMargin,
            right: pdfMargin,
            bottom: pdfMargin
        },
        printBackground: true
    });
    await browser.close();
}


module.exports = buildPdf;

