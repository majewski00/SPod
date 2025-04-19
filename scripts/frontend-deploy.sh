#!/bin/bash
mkdir -p logs
exec > >(tee logs/frontend-deploy-log.txt) 2>&1

source ./local-vars.sh

cd ./src/frontend || { echo "Failed to change directory!"; exit 1; }
source ./frontend-vars.sh 

export IS_OFFLINE=0

npx vite build

# Get the S3 bucket name from SSM Parameter Store
S3_BUCKET_NAME=$(aws ssm get-parameter --name "/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/s3_frontend_bucket_name"  | jq -r .Parameter.Value)

echo "S3 Bucket Name: $S3_BUCKET_NAME"
aws s3 sync --delete "../dist" s3://$S3_BUCKET_NAME/

echo "Frontend deployment to S3 completed successfully"
