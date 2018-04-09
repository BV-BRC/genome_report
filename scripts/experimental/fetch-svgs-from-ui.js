#!/usr/bin/env node
/**
 *
 * fetch-svgs-from-ui.js
 *
 * Example usage:
 *      ./fetch-svgs-from-ui.js --genome_id=520456.3
 *
 * Authors:
 *      nconrad
 *      hyoo
 *
*/

const fs = require('fs'),
    path = require('path'),
    process = require('process'),
    opts = require('commander'),
    puppeteer = require('puppeteer');

const utils = require('../utils');
const config = require('../../config.json');
const { convert } = require('convert-svg-to-png');


if (require.main === module){
    opts.option('-g, --genome_id [value]', 'Genome ID to create images for.')
        .parse(process.argv);

    if (!opts.genome_id) {
        console.error("\nMust provide a genome ID.\n");
        process.exit(1);
    }

    getImage(opts.genome_id);
}


async function getImage(id) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setViewport({width: 1400, height: 1000})

    let svgContent, svg, png;

    // get circular viewer
    console.log('fetching circular viewer...')
    await page.goto(`https://patricbrc.org/view/Genome/${id}#view_tab=circular`, {
        waitUntil: 'networkidle2',
        timeout: 0
    });
    svg = await page.$eval('#dijit_layout_TabContainer_0_circular svg', el => el.outerHTML)

    let genomeDir = utils.createGenomeDir(id);
    let outPath = path.resolve(`${genomeDir}/${id}-circular.svg`);

    console.log(`writing ${outPath}...`);
    await utils.writeFile(outPath, svg);



    // get subsystems chart
    console.log('fetching subsystems viewer...')
    await page.goto(`https://www.alpha.patricbrc.org/view/Genome/${id}#view_tab=subsystems`, {
        waitUntil: 'networkidle0',
        timeout: 0
    });
    svgInner = await page.$eval('#subsystemspiechart svg', el => el.innerHTML)
    svg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg">' + svgInner + '</svg>'

    outPath = path.resolve(`${genomeDir}/${id}-subsystem.svg`);

    console.log(`writing ${outPath}...`)
    await utils.writeFile(outPath, svg);

    await browser.close();

    return;
};


module.exports = getImage;



