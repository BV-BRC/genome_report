#!/usr/bin/env node

/**
 * pie-chart.js
 *
 * Example usage:
 *
 *     let pieChart = require('lib/pie-chart');
 *
 *
 * Author(s):
 *      nconrad
 *
 * Based on: https://codepen.io/zakariachowdhury/pen/OWdyjq
 *
*/


const d3 = require('d3');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { document } = (new JSDOM()).window;


function pieChart(data) {
    var text = "";

    var width = 200;
    var height = 200;
    var thickness = 40;
    var duration = 750;
    var padding = 10;
    var opacity = .8;
    var opacityHover = 1;
    var otherOpacityOnHover = .8;
    var tooltipMargin = 13;

    var radius = Math.min(width-padding, height-padding) / 2;
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var svg = d3.select(document.body)
        .append('svg')
        .attr('class', 'pie')
        .attr('width', width)
        .attr('height', height);

    var g = svg.append('g')
        .attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')');

    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function(d) { return d.value; })
        .sort(null);

    var path = g.selectAll('path')
        .data(pie(data))
        .enter()
        .append("g")
        .append('path')
        .attr('d', arc)
        .attr('fill', (d,i) => color(i))
        .style('opacity', opacity)
        .style('stroke', 'white')


    let legend = svg.append('g')
        .attr('class', 'legend')
        .style('margin-top', '30px');

    let keys = legend.selectAll('.key')
        .data(data)
        .enter().append('div')
        .attr('class', 'key')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('margin-right', '20px');

    keys.append('g')
        .attr('class', 'key-box')
        .style('height', '12px')
        .style('width', '12px')
        .style('margin', '3px 5px 5px 5px')

        .style('background-color', (d, i) => color(i));

    keys.append('g')
        .attr('class', 'name')
        .text(d => `${d.name} (${d.value})`);

    keys.exit().remove();

    return document.body.innerHTML;
}

module.exports = pieChart;
