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
    //puppeteer = require('puppeteer'),
    handlebars = require('handlebars'),
    helpers = require('handlebars-helpers'),
    utils = require('./utils'),
    cheerio = require('cheerio');

const config = require('../config.json');
const templatePath = path.resolve(`${config.templatePath}`);
const pdfMargin = '35px';

// load template helpers
helpers.array();
helpers.number();
utils.helpers(handlebars);



// template data to be used
const tmplData = {
    author: {
        name: 'nconrad'
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

    let genomeID = opts.genome_id;

    // fill html template and save as pdf
    buildPdf(genomeID);
}

async function buildPdf(genomeID, includePDF) {
    let genomeDir = utils.createGenomeDir(genomeID);
    let d = await utils.readFile(`${genomeDir}/${genomeID}-data.json`, 'utf8');
    let reportData = JSON.parse(d);

    // merge in report data
    Object.assign(tmplData, reportData);

    console.log('Reading template...')
    fs.readFile(templatePath, (err, source) => {
        if (err) throw err;

        console.log('Filling template...');
        let template = handlebars.compile(source.toString());
        let content = template(tmplData);

        console.log('Adding table/figure numbers...')
        content = addTableNumbers(content);

        let htmlPath = path.resolve(`${genomeDir}/genome-report.html`);
        console.log(`Writing html to ${htmlPath}...`);
        fs.writeFileSync(htmlPath, content);

        if (includePDF) {
            let pdfPath = path.resolve(`${genomeDir}/genome-report.pdf`);
            generatePdf(htmlPath, pdfPath);
        }
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

