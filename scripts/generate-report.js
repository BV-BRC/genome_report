#!/usr/bin/env node
/**
 *
 * generate-report.js
 *
 * Example usage:
 *      ./generate-report.js --genome_id=83332.12
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
    utils = require('./utils');

const puppeteer = require('puppeteer');

const config = require('../config.json');
const TEMPLATE_PATH = path.resolve(`../${config.templatePath}`);


const pdfMargin = '35px';

const tmplData = {
    author: {
        name: 'nconrad'
    },
    org: {
        name: "Mycobacterium tuberculosis H37Rv"
    },
    reportDate: new Date().toJSON().slice(0,10).replace(/-/g,'/')
}


if (require.main === module){
    opts.option('-g, --genome_id [value]', 'Genome ID to create report for.')
        .parse(process.argv)

    if (!opts.genome_id) {
        console.error("\nMust provide a genome ID.\n");
        process.exit(1);
    }

    let genomeId = opts.genome_id;
    tmplData.org.id = genomeId;

    // fill html template and save as pdf
    buildPdf(genomeId);
}


function buildPdf(genomeId) {
    console.log('Reading template...')
    fs.readFile(TEMPLATE_PATH, (err, data) => {
        if (err) throw err;

        console.log('Filling template...');
        let output = mustache.render(data.toString(), tmplData);

        let genomeDir = utils.createGenomeDir(genomeId);

        let htmlPath = path.resolve(`${genomeDir}/genome-report.html`);
        console.log(`Writing html to ${htmlPath}...`);
        fs.writeFileSync(htmlPath, output);

        let pdfPath = path.resolve(`${genomeDir}/genome-report.pdf`);
        generatePdf(htmlPath, pdfPath);
    });
}


async function generatePdf(htmlPath, outPath) {
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, {waitUntil: 'networkidle2'});

    console.log(`Generating pdf ${outPath}...`)
    await page.pdf({path: outPath, format: 'A4', margin: {
        top: pdfMargin,
        left: pdfMargin,
        right: pdfMargin,
        bottom: pdfMargin
    }});
    await browser.close();

    console.log('Done.');
}


