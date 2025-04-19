#!/bin/bash
mkdir -p logs
exec > >(tee logs/deploy-log.txt) 2>&1
source ./local-vars.sh

CDK_DEPLOY_ACCOUNT=$(aws sts get-caller-identity --profile "$AWS_PROFILE" | jq -r .Account)

echo "Using project-local AWS CDK version..."
npx cdk --version  # Prints the version being used

if [ -z "$CDK_DEPLOY_ACCOUNT" ]; then
  echo "AWS credentials not found. Did you run 'aws configure' or set AWS_PROFILE?"
  exit 1
fi
echo "AWS Account: $CDK_DEPLOY_ACCOUNT"
echo "AWS Region: $AWS_REGION"

cd ./src/infrastructure  || { echo "Failed to change directory!"; exit 1; }

echo "Bootstrapping CDK Toolkit..."
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region "$AWS_REGION" > /dev/null 2>&1; then
  npx cdk bootstrap aws://"$CDK_DEPLOY_ACCOUNT"/"$AWS_REGION" || { echo "Bootstrap failed!"; exit 1; }
else
  echo  "CDK Toolkit stack already exists in $AWS_REGION. Skipping bootstrapping..."
fi

echo "Deploying all stacks..."
npx cdk deploy --require-approval=never --ci --all || { echo "CDK deployment failed!"; exit 1; }


if [ -z "${DOMAIN_NAME// }" ]; then
  export SECOND_DEPLOYMENT=1
  echo ">> Domain not set. Proceeding with second deployment... <<"
  sleep 10

  npx cdk deploy --require-approval=never --ci --all || { echo "Phase 2 deployment failed!"; exit 1; }

else
  echo ">> Domain set. Skipping second deployment... <<"
  echo "DOMAIN is: '${DOMAIN_NAME}'"
fi

echo "Deployment completed successfully."
cd ../..

exit 0
