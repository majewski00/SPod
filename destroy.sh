#!/bin/bash
exec > >(tee destroy-log.txt) 2>&1
source ./local-vars.sh

CDK_DEPLOY_ACCOUNT=$(aws sts get-caller-identity --profile "$AWS_PROFILE" | jq -r .Account)

echo "Using project-local AWS CDK version..."
npx cdk --version

if [ -z "$CDK_DEPLOY_ACCOUNT" ]; then
  echo "AWS credentials not found. Did you run 'aws configure' and set AWS_PROFILE?"
  exit 1
fi

cd ./src/infrastructure || { echo "Failed to change directory!"; exit 1; }

# TODO: S3 deletion is not working

npx cdk destroy --require-approval=never --ci --all -f || { echo "CDK destroy failed!"; exit 1; }

cd ../..
exit 0
