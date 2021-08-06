#!/bin/bash

mvn -pl models clean install
mvn -q clean package
