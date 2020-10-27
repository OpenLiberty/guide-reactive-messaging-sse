#!/bin/bash

echo Building images

docker build -t system:1.0-SNAPSHOT system/. &
docker build -t frontend:1.0-SNAPSHOT frontend/. &

wait
echo Images building completed