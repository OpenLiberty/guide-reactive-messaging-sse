#!/bin/bash
set -euxo pipefail

##############################################################################
##
##  Travis CI test script
##
##############################################################################

./scripts/packageApps.sh

mvn -pl system verify

./scripts/buildImages.sh
./scripts/startContainers.sh

sleep 180

frontendStatus="$(curl --write-out "%{http_code}" --silent --output /dev/null "http://localhost:9080")"

docker exec system1 cat /logs/messages.log | grep product
docker exec system1 cat /logs/messages.log | grep java

if [ "$frontendStatus" == "200" ]
then 
  echo Frontend OK
else 
  echo Frontend status:
  echo "$frontendStatus"
  echo ENDPOINT
  exit 1
fi

./scripts/stopContainers.sh
