#!/bin/bash
while getopts t:d:b:u: flag; do
    case "${flag}" in
    t) DATE="${OPTARG}" ;;
    d) DRIVER="${OPTARG}" ;;
    *) echo "Invalid option" ;;
    esac
done

echo "Testing daily OpenLiberty image"

sed -i "\#</containerRunOpts>#a<install><runtimeUrl>https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/$DATE/$DRIVER</runtimeUrl></install>" system/pom.xml
sed -i "\#<artifactId>liberty-maven-plugin</artifactId>#a<configuration><install><runtimeUrl>https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/$DATE/$DRIVER</runtimeUrl></install></configuration>" bff/pom.xml frontend/pom.xml
cat system/pom.xml bff/pom.xml frontend/pom.xml

../scripts/testApp.sh
