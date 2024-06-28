# BV-BRC Genome Report Tool

## Overview

This module implements a node.js-based service to generate the genome reports used in the [comprehensive genome analysis](https://www.bv-brc.org/docs/quick_references/services/comprehensive_genome_analysis_service.html) service.

## About this module

This module is a component of the BV-BRC build system. It is designed to fit into the
`dev_container` infrastructure which manages development and production deployment of
the components of the BV-BRC. More documentation is available [here](https://github.com/BV-BRC/dev_container/tree/master/README.md).


### Requirements

- node (8.9.1+)
- npm (5.6.0+)

### Local Installation

```
cd genome_report
npm install
```

### Prod Installation

The following will not install any dev dependencies

```
npm install --production
```


### Usage

Create html report, given GTO (Genome Typed Object) as input

```
./create-report.js -i sample-data/bin2.1.genome  -o reports/test-report.html
```


### Development

Serve repo and listen for changes with

```
npm start
```


### Update Sample Reports

```
npm run build
```

This will generate three different reports with the sample data found in `sample-data/`.


## Dev Notes

[Handlebars](https://github.com/wycats/handlebars.js/) is used for templating (`templates/gr-template.html`).  A full list of helpers is available here: [handlebars-helpers](https://github.com/helpers/handlebars-helpers)
