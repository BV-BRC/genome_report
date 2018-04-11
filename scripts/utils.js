#!/usr/bin/env node
/**
 *
 * utils.js
 *
 * Utility functions for genome-report file organization and such.
 *
 * Author(s):
 *      nconrad
*/

const fs = require('fs'),
    path = require('path'),
    moment = require('moment');



function helpers(handlebars) {

    handlebars.registerHelper('datetime', function(date) {
        return moment(date).format('MMMM Do YYYY, h:mm:ssa');
    })

    handlebars.registerHelper('elapsed', function(seconds) {
        const duration = moment.duration(seconds, 'S')
        const days = Math.round(duration.days()),
            hours = Math.round(duration.hours()),
            mins = Math.round(duration.minutes()),
            secs = Math.round(duration.seconds());

        if(days > 0) return `${days} days and ${hours} hours`;
        if(hours > 0) return `${hours} hours and ${mins} minutes and ${secs} seconds`;
        if(mins > 0) return `${mins} minutes and ${secs} seconds`;
        if(secs > 0) return `${secs} seconds`;
        return 0;
    })

    // helper to format base pairs to Bps, Kbps, etc.
    handlebars.registerHelper('basePairs', function(number, precision) {
        if (number == null) return '0 Bp';

        if (isNaN(number)) {
            number = number.length;
            if (!number) return '0 Bp';
        }

        if (isNaN(precision)) {
            precision = 2;
        }

        var abbr = ['Bp', 'Kbps', 'Mbp', 'Gb'];
        precision = Math.pow(10, precision);
        number = Number(number);

        var len = abbr.length - 1;
        while (len-- >= 0) {
            var size = Math.pow(10, len * 3);
            if (size <= (number + 1)) {
                number = Math.round(number * precision / size) / precision;
                number += ' ' + abbr[len];
                break;
            }
        }

        return number;
    })

    // returns specified value (given key) from list of objects
    // if name in object matches "match"
    handlebars.registerHelper('get', function(key, match, objs, defaultStr) {
        if (objs === undefined)
            return (typeof undefinedStr !== 'object' ? undefinedStr : '-');

        return objs.filter(o => o.name === match)[0][key];
    })


    handlebars.registerHelper('default', function(item, str) {
        return item ? item : str;
    })

    // modify helpers version
    handlebars.registerHelper('addCommas', function(num, undefinedStr) {
        if (num === undefined)
            return (typeof undefinedStr !== 'object' ? undefinedStr : '-');

        return num.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    })
}



module.exports = {
    helpers,
}