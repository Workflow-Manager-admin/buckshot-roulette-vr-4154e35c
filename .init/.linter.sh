#!/bin/bash
cd /home/kavia/workspace/code-generation/buckshot-roulette-vr-4154e35c/vr_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

