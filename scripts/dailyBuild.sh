#!/bin/bash
while getopts t:d:b:u: flag; do
    case "${flag}" in
    t) DATE="${OPTARG}" ;;
    d) DRIVER="${OPTARG}" ;;
    b) BUILD="${OPTARG}" ;;
    u) DOCKER_USERNAME="${OPTARG}" ;;
    *) echo "Invalid option" ;;
    esac
done

echo "Testing daily OpenLiberty image"

sed -i "\#<artifactId>liberty-maven-plugin</artifactId>#a<configuration><install><runtimeUrl>https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/$DATE/$DRIVER</runtimeUrl></install></configuration>" system/pom.xml frontend/pom.xml
cat system/pom.xml frontend/pom.xml

sed -i "s;FROM openliberty/open-liberty:full-java11-openj9-ubi;FROM $DOCKER_USERNAME/olguides:$BUILD;g" system/Dockerfile frontend/Dockerfile
cat system/Dockerfile frontend/Dockerfile

docker pull "$DOCKER_USERNAME/olguides:$BUILD"

../scripts/testApp.sh
