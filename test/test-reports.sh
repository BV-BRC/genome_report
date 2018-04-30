
./scripts/create-report.js -i sample-data/sample.genome -o reports/test-report.html -c sample-data/myco.svg -s sample-data/myco.ss-colors -t sample-data/CodonTree.svg
printf "\n"

./scripts/create-report.js -i sample-data/sample.amr.genome -o reports/test-report-amr.html -c sample-data/myco.svg -s sample-data/myco.ss-colors -t sample-data/CodonTree.svg
printf "\n"

./scripts/create-report.js -i sample-data/bin.1.28116.genome.new -o reports/test-report-amr2.html -c sample-data/myco.svg -s sample-data/myco.ss-colors -t sample-data/CodonTree.svg
printf "\n"