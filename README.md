# genome-report
Server-side generation of PATRIC Genome Reports.

## Requirements

- node (8.9.1+)
- npm (5.6.0+)

## Local Installation

```
cd genome_report
npm install
```

## Prod Installation

The following will not install any dev dependencies

```
npm install --production
```


## Usage

##### Create html report given GTO (Genome Typed Object).

```
./create-report.js -i example-data/buchnera.genome.new  -o reports/test-report.html
```


## Development

Serve the template and listen for changes with

```
npm start
```



## Dev Notes

[Handlebars](https://github.com/wycats/handlebars.js/) is used for templating (`templates/gr-template.html).  A full list of helpers is available here: [handlebars-helpers](https://github.com/helpers/handlebars-helpers)



## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request
