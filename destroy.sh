source ./local-vars.sh

CDK_DEPLOY_ACCOUNT=$(aws sts get-caller-identity --profile "$AWS_PROFILE" | jq -r .Account)

echo "Using project-local AWS CDK version..."
npx cdk --version  # Prints the version being used

if [ -z "$CDK_DEPLOY_ACCOUNT" ]; then
  echo "AWS credentials not found. Did you run 'aws configure' or set AWS_PROFILE?"
  #exit 1
fi
echo "AWS Account: $CDK_DEPLOY_ACCOUNT"
echo "AWS Region: $AWS_REGION"

cd ./src/infrastructure

npx cdk destroy --require-approval=never --ci --all -f

cd ../..
