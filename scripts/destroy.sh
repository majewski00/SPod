#!/bin/bash
mkdir -p logs
exec > >(tee logs/destroy-log.txt) 2>&1
source ./local-vars.sh

CDK_DEPLOY_ACCOUNT=$(aws sts get-caller-identity --profile "$AWS_PROFILE" | jq -r .Account)

echo "Using project-local AWS CDK version..."
npx cdk --version

if [ -z "$CDK_DEPLOY_ACCOUNT" ]; then
  echo "AWS credentials not found. Did you run 'aws configure' and set AWS_PROFILE?"
  exit 1
fi

## ! THIS IS A TEMPORARY PART FOR EARLY DEVELOPMENT. PLEASE REMOVE!!

DELETE_BUCKETS=false
while [[ "$#" -gt 0 ]]; do
  case $1 in
    -E|--empty-s3) DELETE_BUCKETS=true ;; # Enable bucket deletion
    -h|--help)
      echo "Usage: ./destroy.sh [OPTIONS]"
      echo "Options:"
      echo "  -E, --empty-s3    Empty and delete S3 buckets matching SERVICE and BUILD_STAGE=dev"
      echo "  -h, --help        Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use -h or --help for usage information."
      exit 1
      ;;
  esac
  shift
done

empty_and_delete_s3_buckets() {
  echo "Fetching list of S3 buckets..."
  BUCKETS=$(aws s3api list-buckets --query "Buckets[].Name" --profile "$AWS_PROFILE" --output text)

  for BUCKET in $BUCKETS; do
    if [[ "$BUCKET" == *"$SERVICE"* && "$BUCKET" == *"dev"* ]]; then
      echo "Emptying bucket: $BUCKET"
      aws s3 rm "s3://$BUCKET" --recursive --profile "$AWS_PROFILE" || {
        echo "Failed to empty bucket: $BUCKET"
        exit 1
      }
      echo "Deleting bucket: $BUCKET"
      aws s3api delete-bucket --bucket "$BUCKET" --profile "$AWS_PROFILE" || {
        echo "Failed to delete bucket: $BUCKET"
        exit 1
      }
    else
      echo "Skipping bucket: $BUCKET (does not match SERVICE or BUILD_STAGE=dev)"
    fi
  done
}

# Empty and optionally delete S3 buckets before destroying stacks
if [ "$DELETE_BUCKETS" = true ]; then
  empty_and_delete_s3_buckets
fi


cd ./src/infrastructure || { echo "Failed to change directory!"; exit 1; }

# TODO: S3 deletion is not working

npx cdk destroy --require-approval=never --ci --all -f || { echo "CDK destroy failed!"; exit 1; }

cd ../..
exit 0
