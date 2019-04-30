
# test-reports.sh
#
# This is simple script to create reports for a few different objects
#
# Note:
#   To get the latest GTOs for "test-report-amr.html",
#   I've been running https://patricbrc.org/app/ComprehensiveGenomeAnalysis
#   with "Staphylococcus aureus strain VB4283.contigs.fasta"


./scripts/create-report.js -i sample-data/sample.genome -o reports/test-report.html -c sample-data/myco.svg -s sample-data/myco.ss-colors -t sample-data/CodonTree.svg
printf "\n"

./scripts/create-report.js -i sample-data/sample.amr.genome -o reports/test-report-amr.html -c sample-data/myco.svg -s sample-data/myco.ss-colors -t sample-data/CodonTree.svg
printf "\n"

./scripts/create-report.js -i sample-data/bin.1.28116.genome.new -o reports/test-report-amr2.html -c sample-data/myco.svg -s sample-data/myco.ss-colors -t sample-data/CodonTree.svg
printf "\n"