import * as cdk from "aws-cdk-lib";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as ssm from "aws-cdk-lib/aws-ssm";

export class ApiStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { cognito } = props;

    const SERVICE = process.env.SERVICE;
    const BUILD_STAGE = process.env.BUILD_STAGE;
    const AWS_REGION = process.env.AWS_REGION;

    const httpApi = new apigatewayv2.HttpApi(this, `${SERVICE}-HttpApi`, {
      apiName: `${SERVICE}-${BUILD_STAGE}-http-api`,
      corsPreflight: {
        allowHeaders: [
          "Content-Type",
          "Authorization",
          "X-Amz-Date",
          "X-Api-Key",
        ],
        allowMethods: [
          apigatewayv2.HttpMethod.GET,
          apigatewayv2.HttpMethod.POST,
          apigatewayv2.HttpMethod.OPTIONS,
          apigatewayv2.HttpMethod.DELETE,
        ],
        allowOrigins: ["*"], // TODO: update this to the frontend domain
        maxAge: cdk.Duration.hours(1),
      },
    });
    const httpApiAuthorizer = new apigatewayv2.CfnAuthorizer(
      this,
      "CognitoAuthorizer",
      {
        apiId: httpApi.apiId,
        authorizerType: "JWT",
        identitySource: ["$request.header.Authorization"],
        name: "cognito-authorizer",
        jwtConfiguration: {
          audience: [cognito.userPoolClientId],
          issuer: `https://cognito-idp.${AWS_REGION}.amazonaws.com/${cognito.userPoolId}`,
        },
      }
    );
    httpApi.addStage(`${BUILD_STAGE}`, {
      stageName: `${BUILD_STAGE}`,
      autoDeploy: true,
    });

    new ssm.StringParameter(this, `${SERVICE}-ApiGatewayRestApiIdParameter`, {
      parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/api_gateway_rest_api_id`,
      stringValue: httpApi.apiId,
    });

    new ssm.StringParameter(
      this,
      `${SERVICE}-ApiGatewayAuthorizerIdCognitoParameter`,
      {
        parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/api_gateway_authorizer_id_cognito`,
        stringValue: httpApiAuthorizer.authorizerId, // TODO: verify
      }
    );
    // TODO: HTTP API URL
    // stringValue: `https://${USE_DOMAIN ? httpApiDomains[0] : this.httpApiDistribution.domainName}`
    // httpApiDistribution == CF distribution
  }
}
