# genome-report
Server-side Generation of PATRIC Genome Reports.

## Requirements

- node (8.9.1+)
- npm (5.6.0+)

## Local Installation

```
cd genome_report
npm install
```

## Development

Serve the template and listen for changes with

```
npm start
```

## Usage

##### Fetch all assets/data and generate html/pdf

```
node scripts/genome-report.js --genome_id=520456.3
```


##### To run scripts individually

Fetch images and write to `reports/{genome-id}/`

```
node scripts/fetch-images.js --genome_id=520456.3
```

Fetch data and write to `reports/{genome-id}/`

```
node scripts/fetch-data.js --genome_id=520456.3
```

Generate and write html/pdf to `reports/{genome-id}/`

```
node scripts/create-report.js --genome_id=520456.3
```

## Prod Installation

The following will not install any dev dependencies

```
npm install --production
```


## Dev Notes

[Handlebars](https://github.com/wycats/handlebars.js/) is used for templating (`templates/gr-template.html).  A full list of helps is available here: [handlebars-helpers](https://github.com/helpers/handlebars-helpers)



## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request
