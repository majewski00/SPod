if [ -z "$SERVICE" ] || [ -z "$BUILD_STAGE" ] || [ -z "$AWS_REGION" ]; then
  echo "Required environment variables are not set. Please check local-vars.sh"
  exit 1
fi

COGNITO_USER_POOL_CLIENT_ID=$(aws ssm get-parameter --name "/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/user_pool_client_id" | jq -r .Parameter.Value)
COGNITO_USER_POOL_ID=$(aws ssm get-parameter --name "/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/user_pool_id" | jq -r .Parameter.Value)
COGNITO_DOMAIN=$(aws ssm get-parameter --name "/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/cognito_domain" | jq -r .Parameter.Value)

export COGNITO_USER_POOL_CLIENT_ID
export COGNITO_USER_POOL_ID
export COGNITO_DOMAIN