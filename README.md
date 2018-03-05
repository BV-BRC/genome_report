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

## Devlopment

Serve the template and listen for changes with

```
npm start
```

## Prod Installation

The following will not install any dev dependencies

```
npm install --production
```

## Usage

Fetch images and write to `reports/{genome-id}/`

```
./fetch-images.js --genome_id=83332.12
```

Fetch data and write to `reports/{genome-id}/`

```
./fetch-images.js --genome_id=83332.12
```

Generate and write html/pdf to `reports/{genome-id}/`

```
./generate-report.js --genome_id=83332.12
```


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request
