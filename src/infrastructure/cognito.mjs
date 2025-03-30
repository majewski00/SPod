import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as ses from "aws-cdk-lib/aws-ses";

export class CognitoStack extends cdk.Stack {
  userPool;
  userPoolId;
  userPoolClient;
  userPoolDomain;
  userPoolClientId;

  constructor(scope, id, props) {
    super(scope, id, props);

    const SERVICE = process.env.SERVICE;
    const BUILD_STAGE = process.env.BUILD_STAGE;
    const AWS_REGION = process.env.AWS_REGION;
    const SES_IDENTITY_ARN = process.env.SES_IDENTITY_ARN;

    const clientUrls = ["http://localhost:4000"];

    let userPoolEmail;
    if (SES_IDENTITY_ARN) {
      const emailIdentity = ses.EmailIdentity.fromEmailIdentityName(
        this,
        `${SERVICE}-emailIdentity`,
        SES_IDENTITY_ARN
      );

      userPoolEmail = cognito.UserPoolEmail.withSES({
        fromEmail: emailIdentity.emailIdentityName,
        fromName: "SPod",
        replyTo: emailIdentity.emailIdentityName,
        sesRegion: AWS_REGION,
      });
    } else {
      userPoolEmail = cognito.UserPoolEmail.withCognito();
    }

    // TODO: Add MFA
    this.userPool = new cognito.UserPool(this, `${SERVICE}-UserPool`, {
      userPoolName: `${SERVICE}-${BUILD_STAGE}-user-pool`,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: false,
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
      },
      standardAttributes: {
        fullname: {
          required: true,
          mutable: true,
        },
      },
      email: userPoolEmail,
    });

    // TODO: SAML Identity Provider
    const supportedIdentityProviders = [
      cognito.UserPoolClientIdentityProvider.COGNITO,
    ];

    const userPoolClient = this.userPool.addClient(
      `${SERVICE}-UserPoolClient`,
      {
        userPoolClientName: `${SERVICE}-${BUILD_STAGE}-client`,
        authFlows: {
          adminUserPassword: false,
          userPassword: true,
          userSrp: true,
        },
        oAuth: {
          callbackUrls: clientUrls,
          logoutUrls: clientUrls,
          flows: { authorizationCodeGrant: true },
          scopes: [
            cognito.OAuthScope.EMAIL,
            cognito.OAuthScope.OPENID,
            cognito.OAuthScope.PROFILE,
          ],
        },
        generateSecret: false,
        preventUserExistenceErrors: true,
        supportedIdentityProviders,
      }
    );
    this.userPoolDomain = this.userPool.addDomain(`${SERVICE}-userPoolDomain`, {
      cognitoDomain: {
        domainPrefix: SERVICE.toLowerCase() + "-" + BUILD_STAGE, // TODO: this.account.substring(0, 5)
      },
    });
    this.userPoolClientId = userPoolClient.userPoolClientId;
    this.userPoolId = this.userPool.userPoolId;

    new ssm.StringParameter(this, `${SERVICE}-UserPoolClientIdParameter`, {
      parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/user_pool_client_id`,
      stringValue: userPoolClient.userPoolClientId,
    });
    new ssm.StringParameter(this, `${SERVICE}-UserPoolIdParameter`, {
      parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/user_pool_id`,
      stringValue: this.userPool.userPoolId,
    });
    new ssm.StringParameter(this, `${SERVICE}-CognitoDomainParameter`, {
      parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/cognito_domain`,
      stringValue: `${this.userPoolDomain.domainName}.auth.${AWS_REGION}.amazoncognito.com`,
    });
  }
}
