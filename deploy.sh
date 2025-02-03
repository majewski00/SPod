#!/bin/bash
npm ci
npm install -g aws-cdk

cd ./src/infrastructure || exit 1
npx cdk deploy --require-approval=never --ci --all

exit 0
