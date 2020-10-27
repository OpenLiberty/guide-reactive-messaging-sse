
@ECHO Starting Scripts
@ECHO OFF

start /b docker build -q -t system:1.0-SNAPSHOT system\.
start /b docker build -q -t frontend:1.0-SNAPSHOT frontend\.