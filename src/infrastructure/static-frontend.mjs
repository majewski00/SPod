import * as cdk from 'aws-cdk-lib'
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as ssm from 'aws-cdk-lib/aws-ssm'

export class FrontendStack extends cdk.Stack {
    cloudfrontDistribution

    constructor(scope, id, props) {
        super(scope, id, props);

        const SERVICE = process.env.SERVICE
        const BUILD_STAGE = process.env.BUILD_STAGE
        const AWS_REGION = process.env.AWS_REGION

        const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, `${SERVICE}-OriginAccessIdentity`, {
                comment: `${SERVICE} ${BUILD_STAGE} ${AWS_REGION} Origin Access Identity`
            }
        )
        this.frontendBucket = new s3.Bucket(this, `${SERVICE}-Frontend-Bucket`, {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            bucketName: `${SERVICE}-${BUILD_STAGE}-site`,
            publicReadAccess: false,
            removalPolicy: cdk.RemovalPolicy.RETAIN
        })
        this.frontendBucket.addToResourcePolicy(
            new iam.PolicyStatement({
                actions: ['s3:GetObject'],
                principals: [
                    new iam.CanonicalUserPrincipal(
                        originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
                    ),
                ],
                resources: [this.frontendBucket.arnForObjects('*')],
            })
        );

        this.cloudfrontDistribution = new cloudfront.Distribution(this, `${SERVICE}-SiteCloudFrontDistribution`, {
            comment: `${SERVICE}-${BUILD_STAGE}-frontend`,
            defaultBehavior: {
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
                origin: new origins.S3BucketOrigin(this.frontendBucket, {
                    originAccessIdentity
                }),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            },
            defaultRootObject: `index.html`,
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 404,
                    responsePagePath: '/error.html',
                },
            ],
            domainNames: undefined,
            certificate: undefined,
            priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
            env: {
                account: process.env.CDK_DEPLOY_ACCOUNT,
                region: 'us-east-1'
            }
        })

        new ssm.StringParameter(this, `${SERVICE}-FrontendBucketIdParameter`, {
            parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/frontend_bucket_id`,
            stringValue: this.frontendBucket.bucketName
        })
        new ssm.StringParameter(this, `${SERVICE}-CloudfrontDistributionIdParameter`, {
            parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/cloudfront_distribution`,
            stringValue: this.cloudfrontDistribution.distributionId
        })
        new ssm.StringParameter(this, `${SERVICE}-CloudfrontDomainParameter`, {
            parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/cloudfront_domain`,
            stringValue: this.cloudfrontDistribution.distributionDomainName
        });
    }
}