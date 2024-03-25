#!/bin/bash

KAFKA_SERVER=kafka:9092
NETWORK=reactive-app

docker network create $NETWORK

docker run -d \
    -e ALLOW_PLAINTEXT_LISTENER=yes \
    -e KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092 \
    -e KAFKA_CFG_NODE_ID=0 \
    -e KAFKA_CFG_PROCESS_ROLES=controller,broker \
    -e KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 \
    -e KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@kafka:9093 \
    -e KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER \
    --hostname=kafka \
    --network=$NETWORK \
    --name=kafka \
    --rm \
    bitnami/kafka:latest
  
sleep 15

docker run -d \
  -e UPDATE_INTERVAL=3 \
  -e MP_MESSAGING_CONNECTOR_LIBERTY_KAFKA_BOOTSTRAP_SERVERS=$KAFKA_SERVER \
  -e WLP_LOGGING_CONSOLE_LOGLEVEL=info \
  --network=$NETWORK \
  --name=system1 \
  --rm \
  system:1.0-SNAPSHOT &

  docker run -d \
  -e UPDATE_INTERVAL=2 \
  -e MP_MESSAGING_CONNECTOR_LIBERTY_KAFKA_BOOTSTRAP_SERVERS=$KAFKA_SERVER \
  -e WLP_LOGGING_CONSOLE_LOGLEVEL=info \
  --network=$NETWORK \
  --name=system2 \
  --rm \
  system:1.0-SNAPSHOT &

  docker run -d \
  -e UPDATE_INTERVAL=6 \
  -e MP_MESSAGING_CONNECTOR_LIBERTY_KAFKA_BOOTSTRAP_SERVERS=$KAFKA_SERVER \
  -e WLP_LOGGING_CONSOLE_LOGLEVEL=info \
  --network=$NETWORK \
  --name=system3 \
  --rm \
  system:1.0-SNAPSHOT &

docker run -d \
  -p 9084:9084 \
  -e MP_MESSAGING_CONNECTOR_LIBERTY_KAFKA_BOOTSTRAP_SERVERS=$KAFKA_SERVER \
  -e WLP_LOGGING_CONSOLE_LOGLEVEL=info \
  --network=$NETWORK \
  --name=bff \
  --rm \
  bff:1.0-SNAPSHOT &

docker run -d \
  -p 9080:9080 \
  -e WLP_LOGGING_CONSOLE_LOGLEVEL=info \
  --network=$NETWORK \
  --name=frontend \
  --rm \
  frontend:1.0-SNAPSHOT &
  
wait
