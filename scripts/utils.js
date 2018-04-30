#!/usr/bin/env node
/**
 *
 * utils.js
 *
 * Utility functions for genome-report templating.
 *
 * Author(s):
 *      nconrad
*/

const moment = require('moment');



function helpers(handlebars) {

    handlebars.registerHelper('datetime', (date) => {
        return moment(date).format('MMMM Do YYYY, h:mm:ssa');
    })

    handlebars.registerHelper('elapsed', (seconds) => {
        const duration = moment.duration(seconds, 'S')
        const days = Math.round(duration.days()),
            hours = Math.round(duration.hours()),
            mins = Math.round(duration.minutes()),
            secs = Math.round(duration.seconds());

        if(days > 0) return `${days} days and ${hours}h${mins}m${secs}s`;
        if(hours > 0) return `${hours}h${mins}m${secs}s`;
        if(mins > 0) return `${mins} minutes and ${secs} seconds`;
        if(secs > 0) return `${secs} seconds`;
        return 0;
    })

    handlebars.registerHelper('currentDate', () => {
        return moment().format('MM/DD/YYYY');
    })


    // helper to format base pairs to Bps, Kbps, etc.
    handlebars.registerHelper('basePairs', (number, precision) => {
        if (number == null) return '0 bp';

        if (isNaN(number)) {
            number = number.length;
            if (!number) return '0 bp';
        }

        if (isNaN(precision)) {
            precision = 2;
        }

        var abbr = ['bp', 'kbp', 'Mbp', 'Gbp'];
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
    handlebars.registerHelper('get', (key, match, objs, defaultStr) => {
        if (objs === undefined)
            return (typeof defaultStr !== 'object' ? defaultStr : '-');

        return Array.isArray(objs) ? objs.filter(o => o.name === match)[0][key] : 'N/A';
    })


    handlebars.registerHelper('default', (item, str) => {
        return item ? item : str;
    })

    // modify helpers version
    handlebars.registerHelper('addCommas', (num, undefinedStr) => {
        if (num === undefined)
            return (typeof undefinedStr !== 'object' ? undefinedStr : '-');

        return num.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    })

    handlebars.registerHelper('plural', (num) => {
        return num == 1 ? '' : 's';
    })

    handlebars.registerHelper('prettyRecipe', (method) => {
        let mapping = {
            spades: 'SPAdes',
            velvet: 'Velvet',
            idba: 'IDBA',
            megahit: 'MEAGHIT',
            plasmidspades: 'plasmidSPADES',
            miniasm: 'Miniasm'
        }

        method = (method || '').toLowerCase()
        return method in mapping ? mapping[method] : method;
    })



}



module.exports = {
    helpers
}