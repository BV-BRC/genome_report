#!/usr/bin/env node
/**
 *
 * shared.js
 *
 * Utility functions for genome-report file organization.
 *
 * Author(s):
 *      nconrad
*/

const fs = require('fs'),
    path = require('path'),
    util = require('util'),

const config = require('../../config.json');


function createGenomeDir(id) {
    let baseDir = path.resolve(`${config.reportDir}`);

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


function parseToken(token) {
    var dataArr = token.split('|');
    var keyValueArr = [];
    var dataobj =  {};
    for (var i = 0; i < dataArr.length; i++) {
        keyValueArr = dataArr[i].split('=');
        dataobj[keyValueArr[0]] = keyValueArr[1];
    }

    return dataobj;
}


module.exports = {
    createGenomeDir,
    parseToken,
}