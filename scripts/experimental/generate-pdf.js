
const puppeteer = require('puppeteer'),



//    console.warn('\x1b[33m', '\nWARNING:\x1b[0m',
//    `No output path provided.  Using default: ${output}\n`);


/**
 * previous method of creating pdf (not in use)
 */
async function generatePdf(htmlPath, outPath) {
    let browser = await puppeteer.launch({ headless: true } );
    let page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, {waitUntil: 'networkidle2'});

    console.log(`Generating pdf ${outPath}...`)
    await page.pdf({
        path: outPath,
        format: 'letter',
        margin: {
            top: pdfMargin,
            left: pdfMargin,
            right: pdfMargin,
            bottom: pdfMargin
        },
        printBackground: true
    });
    await browser.close();
}