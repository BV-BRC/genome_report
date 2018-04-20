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

const color = require('./color').category20;

function pieChart(params) {
    let {data, includeValues, legendText} = params;

    if (!data) {
        console.error('No data provided to pie chart.')
        return;
    }

    let text = "";

    let width = 800;
    let height = 300;
    let thickness = 40;
    let duration = 750;
    let padding = 10;
    let opacity = .8;
    let opacityHover = 1;
    let otherOpacityOnHover = .8;
    let tooltipMargin = 13;
    let keySize = 12;

    let radius = Math.min(width-padding, height-padding) / 2;


    let svg = d3.select(document.body)
        .append('svg')
        .attr('class', 'pie')
        .attr('width', width)
        .attr('height', height);

    let container = svg.append('g')
        .attr('class', 'container');


    let g = container.append('g')
        .attr('transform', 'translate(' + (radius + 10) + ',' + (height/2) + ')');

    let arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    let pie = d3.pie()
        .value((d) => d.value )

    let path = g.selectAll('path')
        .data(pie(data))
        .enter()
        .append("g")
        .append('path')
        .attr('d', arc)
        .attr('fill', (d,i) => (d.color || color[i]))
        .style('opacity', opacity)
        .style('stroke', 'white');


    let x = 2 * radius + 50; // size of pie + 20 padding

    let legend = container.append('g')
        .attr('class', 'legend')

    if (legendText) {
        legend.append('text')
            .text(legendText)
            .attr('font-weight', 500)
            .attr('transform', (d, i) => {
                let y = 20 + (legendText ? i : i + 1) * 20;
                return `translate(${x}, ${y})`
            })

    }

    let keys = legend.selectAll('.key')
        .data(data)
        .enter().append('g')
        .attr('transform', (d, i) => {
            let y = 30 + (legendText ? i+1 : i) * 20;
            return `translate(${x}, ${y})`
        })
        .attr('class', 'key');


    keys.append('rect')
        .attr('class', 'key-box')
        .attr('x', 0)
        .attr('y', -1 * keySize)
        .style('height', keySize + 'px')
        .style('width', keySize + 'px')
        .style('fill', (d, i) => (d.color || color[i]));

    keys.append('text')
        .attr('class', 'name')
        .attr('x', keySize + 5)
        .attr('y', 0)
        .text(d => {
            let label = includeValues ? `${d.name} (${d.value})` : d.name
            return label;
        });


    return document.body.innerHTML;
}

module.exports = pieChart;
