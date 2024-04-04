#!/bin/bash
while getopts t:d: flag; do
    case "${flag}" in
    t) DATE="${OPTARG}" ;;
    d) DRIVER="${OPTARG}" ;;
    *) echo "Invalid option" ;;
    esac
done

echo "Testing latest OpenLiberty Docker image"

sed -i "\#</containerRunOpts>#a<install><runtimeUrl>https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/$DATE/$DRIVER</runtimeUrl></install>" system/pom.xml
sed -i "\#<artifactId>liberty-maven-plugin</artifactId>#a<configuration><install><runtimeUrl>https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/$DATE/$DRIVER</runtimeUrl></install></configuration>" bff/pom.xml frontend/pom.xml
cat system/pom.xml bff/pom.xml frontend/pom.xml

sed -i "s;FROM icr.io/appcafe/open-liberty:kernel-slim-java11-openj9-ubi;FROM openliberty/daily:latest;g" system/Dockerfile bff/Dockerfile frontend/Dockerfile
sed -i "s;RUN features.sh;#RUN features.sh;g" system/Dockerfile bff/Dockerfile frontend/Dockerfile
cat system/Dockerfile bff/Dockerfile frontend/Dockerfile

docker pull -q "openliberty/daily:latest"

../scripts/testApp.sh
