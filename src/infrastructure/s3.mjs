import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as iam from "aws-cdk-lib/aws-iam";

export class S3Stack extends cdk.Stack {
  storageBucket;
  originAccessIdentity;

  constructor(scope, id, props) {
    super(scope, id, props);

    const SERVICE = process.env.SERVICE;
    const BUILD_STAGE = process.env.BUILD_STAGE;
    const AWS_REGION = process.env.AWS_REGION;
    const SECOND_DEPLOYMENT = process.env.SECOND_DEPLOYMENT;
    const DOMAIN_NAME = process.env.DOMAIN_NAME;

    const allowedOrigins = ["https://localhost:4000"];

    if (SECOND_DEPLOYMENT && !DOMAIN_NAME) {
      const cloudfrontDomainName = ssm.StringParameter.valueForStringParameter(
        this,
        `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/cloudfront_domain_name`
      );
      allowedOrigins.push(`https://${cloudfrontDomainName}`);
    } else if (DOMAIN_NAME) {
      allowedOrigins.push(`https://${DOMAIN_NAME}`);
    }

    this.originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      `${SERVICE}-UnifiedDelivery-OAI`,
      {
        comment: `${SERVICE} ${BUILD_STAGE} ${AWS_REGION} Unified Delivery OAI`,
      }
    );

    this.storageBucket = new s3.Bucket(this, `${SERVICE}-storage-bucket`, {
      bucketName: `${SERVICE}-${BUILD_STAGE}-storage-bucket`,
      // removalPolicy: cdk.RemovalPolicy.RETAIN,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    this.storageBucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["*"],
        resources: [
          this.storageBucket.bucketArn,
          `${this.storageBucket.bucketArn}/*`,
        ],
        principals: [new cdk.aws_iam.AnyPrincipal()],
        effect: cdk.aws_iam.Effect.DENY,
        conditions: {
          Bool: {
            "aws:SecureTransport": "false",
          },
        },
        sid: "EnforceSecureTransport",
      })
    );
    this.storageBucket.addCorsRule({
      allowedMethods: [
        s3.HttpMethods.GET,
        s3.HttpMethods.PUT,
        s3.HttpMethods.POST,
        s3.HttpMethods.HEAD,
      ],
      allowedOrigins: allowedOrigins,
      allowedHeaders: ["Authorization", "Content-Type"],
      exposedHeaders: ["ETag"],
    });

    this.storageBucket.addLifecycleRule({
      id: "DeleteOldVersions",
      noncurrentVersionExpiration: cdk.Duration.days(7),
      abortIncompleteMultipartUploadAfter: cdk.Duration.days(2),
    });

    this.storageBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        effect: iam.Effect.ALLOW,
        principals: [
          new iam.CanonicalUserPrincipal(
            this.originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
        resources: [
          `${this.storageBucket.bucketArn}/users/*/files/*`,
          `${this.storageBucket.bucketArn}/users/*/thumbnails/*`,
        ],
      })
    );

    this.frontendBucket = new s3.Bucket(
      this,
      `${SERVICE}-static-website-bucket`,
      {
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        bucketName: `${SERVICE}-${BUILD_STAGE}-static-website`,
        encryption: s3.BucketEncryption.S3_MANAGED,
      }
    );
    this.frontendBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject", "s3:ListBucket"],
        effect: iam.Effect.ALLOW,
        principals: [
          new iam.CanonicalUserPrincipal(
            this.originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
        resources: [
          `${this.frontendBucket.bucketArn}/*`,
          this.frontendBucket.bucketArn,
        ],
      })
    );
    this.frontendBucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["*"],
        resources: [
          this.frontendBucket.bucketArn,
          `${this.frontendBucket.bucketArn}/*`,
        ],
        principals: [new cdk.aws_iam.AnyPrincipal()],
        effect: cdk.aws_iam.Effect.DENY,
        conditions: {
          Bool: {
            "aws:SecureTransport": "false",
          },
        },
        sid: "EnforceSecureTransport",
      })
    );

    new ssm.StringParameter(this, `${SERVICE}-StorageS3BucketIdParameter`, {
      parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/s3_storage_bucket_name`,
      stringValue: this.storageBucket.bucketName,
    });
    new ssm.StringParameter(this, `${SERVICE}-StorageS3BucketArnParameter`, {
      parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/s3_storage_bucket_arn`,
      stringValue: this.storageBucket.bucketArn,
    });
    new ssm.StringParameter(this, `${SERVICE}-FrontendBucketIdParameter`, {
      parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/s3_frontend_bucket_name`,
      stringValue: this.frontendBucket.bucketName,
    });
  }
}
