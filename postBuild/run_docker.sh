#!/bin/env bash
cd ..
docker build -t app . --secret id=config.ts,src=devDexServer/config.ts
echo "Now Running the docker"
docker run -it --rm --name app app