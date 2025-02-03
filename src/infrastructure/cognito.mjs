import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as ssm from "aws-cdk-lib/aws-ssm";


export class CognitoStack extends cdk.Stack {
    userPool
    userPoolClient

    constructor(scope, id, props) {
        super(scope, id, props);

        const SERVICE = process.env.SERVICE
        const BUILD_STAGE = process.env.BUILD_STAGE
        const AWS_REGION = process.env.AWS_REGION

        const clientUrls = ["http://localhost:4000"]

        this.userPool = new cognito.UserPool(this, `${SERVICE}-UserPool`, {
            autoVerify: {
                email: true
            },
            passwordPolicy: {
                minLength: 6
            },
            selfSignUpEnabled: false,
            signInAliases: {
                email: true
            },
            userPoolName: `${SERVICE}-${BUILD_STAGE}-user-pool`,
        });

        const supportedIdentityProviders = [cognito.UserPoolClientIdentityProvider.COGNITO]

        // UserPoolIdentityProviderSaml

        const userPoolClient = this.userPool.addClient(`${SERVICE}-UserPoolClient`, {
            authFlows: {
                adminUserPassword: False,
                userPassword: true,
                userSrp: true
            },
            oAuth: {
                callbackUrls: clientUrls,
                logoutUrls: clientUrls,
                flows: {authorizationCodeGrant: true},
                // scopes
            },
            generateSecret: false,
            preventUserExistenceErrors: true,
            supportedIdentityProviders,
            userPoolClientName: `${SERVICE}-${BUILD_STAGE}-client`
        })

        this.userPoolDomain = this.userPool.addDomain(`${SERVICE}-userPoolDomain`, {
            cognitoDomain: {
                domainPrefix: SERVICE
            }
        })

        new ssm.StringParameter(this, `${SERVICE}-UserPoolClientIdParameter`, {
            parameterName: `${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/user_pool_client_id`,
            stringValue: userPoolClient.userPoolClientId
        })
        new ssm.StringParameter(this, `${SERVICE}-UserPoolIdParameter`, {
            parameterName: `${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/user_pool_id`,
            stringValue: this.userPool.userPoolId
        })
        new ssm.StringParameter(this, `${SERVICE}-CognitoDomainParameter`, {
            parameterName: `${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/cognito_domain`,
            stringValue: `${this.userPoolDomain.domainName}.auth.${AWS_REGION}.amazoncognito.com`
        })
    }
}
