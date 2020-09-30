#!/bin/bash

# docker stop system1 system2 system3 inventory frontend kafka zookeeper
docker stop system1 inventory frontend kafka zookeeper
docker network rm reactive-app