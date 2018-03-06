#!/usr/bin/env node
/**
 *
 * utils.js
 *
 * Utitilty functions for genome-report file organization and such.
 *
 * Author(s):
 *      nconrad
*/

const fs = require('fs'),
    path = require('path'),
    process = require('process'),
    Promise = require("bluebird");

const writeFile = Promise.promisify(fs.writeFile),
    readFile = Promise.promisify(fs.readFile);

const config = require('../config.json');


function createGenomeDir(id) {
    let baseDir = path.resolve(`../${config.reportDir}`);

    // create reports directory if needed
    if (!fs.existsSync(baseDir)){
        console.log(`\ncreating genome directory ${baseDir} ...` )
        fs.mkdirSync(baseDir);
    }

    // create genome directory if needed
    let genomeDir = path.resolve(`${baseDir}/${id}/`);
    if (!fs.existsSync(genomeDir)){
        console.log(`creating genome dir ${genomeDir} ...` )
        fs.mkdirSync(genomeDir);
    }

    return genomeDir;
}


module.exports = {
    createGenomeDir: createGenomeDir,
    writeFile: writeFile,
    readFile: readFile
}