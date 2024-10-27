#!/bin/bash
node gst-eslint-processor/index.mjs test-eslint-report.json -f json -o test-eslint-summary.json
echo ---
cat test-eslint-summary.json
echo