
# build-reports.sh
#
# Simple script to create reports for a few different objects
#
# Note on updating GTOs:
#   To get the latest GTO for "test-report-amr.html",
#   run https://patricbrc.org/app/ComprehensiveGenomeAnalysis
#   with "Staphylococcus aureus strain VB4283.contigs.fasta"
#
#   To get the latest GTO for "test-report-amr1.html" 
#   run https://patricbrc.org/app/ComprehensiveGenomeAnalysis
#   with 28116188.fasta
#


./scripts/create-report.js -i sample-data/sample.genome -o reports/test-report.html -c sample-data/myco.svg -s sample-data/myco.ss-colors -t sample-data/CodonTree.svg
printf "\n"

./scripts/create-report.js -i sample-data/sample.amr.genome -o reports/test-report-amr.html -c sample-data/myco.svg -s sample-data/myco.ss-colors -t sample-data/CodonTree.svg
printf "\n"

./scripts/create-report.js -i sample-data/sample.amr2.genome -o reports/test-report-amr2.html -c sample-data/myco.svg -s sample-data/myco.ss-colors -t sample-data/CodonTree.svg
printf "\n"