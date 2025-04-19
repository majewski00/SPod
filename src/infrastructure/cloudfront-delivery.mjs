import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

export class CloudFrontDeliveryStack extends cdk.Stack {
  cloudfrontDistribution;
  distributionDomainName;

  constructor(scope, id, props) {
    super(scope, id, props);

    const { storageBucket, frontendBucket, originAccessIdentity } = props;

    const SERVICE = process.env.SERVICE;
    const BUILD_STAGE = process.env.BUILD_STAGE;
    const AWS_REGION = process.env.AWS_REGION;

    const thumbnailCachePolicy = new cloudfront.CachePolicy(
      this,
      `${SERVICE}-ThumbnailCachePolicy`,
      {
        cachePolicyName: `${SERVICE}-${BUILD_STAGE}-thumbnail-cache-policy`,
        defaultTtl: cdk.Duration.days(7),
        minTtl: cdk.Duration.days(1),
        maxTtl: cdk.Duration.days(30),
        cookieBehavior: cloudfront.CacheCookieBehavior.allowList(
          "CloudFront-Policy",
          "CloudFront-Signature",
          "CloudFront-Key-Pair-Id"
        ), // Only forward the CloudFront signed cookie headers
        headerBehavior: cloudfront.CacheHeaderBehavior.none(), // Don't use headers for cache key
        queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(), // Don't use query strings for cache key
        enableAcceptEncodingGzip: true, // Support gzip compression
        enableAcceptEncodingBrotli: true, // Support Brotli compression
      }
    );

    const originalFileCachePolicy = new cloudfront.CachePolicy(
      this,
      `${SERVICE}-OriginalFileCachePolicy`,
      {
        cachePolicyName: `${SERVICE}-${BUILD_STAGE}-original-file-cache-policy`,
        defaultTtl: cdk.Duration.hours(24),
        minTtl: cdk.Duration.minutes(5),
        maxTtl: cdk.Duration.days(7),
        cookieBehavior: cloudfront.CacheCookieBehavior.allowList(
          "CloudFront-Policy",
          "CloudFront-Signature",
          "CloudFront-Key-Pair-Id"
        ),
        headerBehavior: cloudfront.CacheHeaderBehavior.none(),
        queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
        enableAcceptEncodingGzip: true,
        enableAcceptEncodingBrotli: true,
      }
    );

    this.cloudfrontDistribution = new cloudfront.Distribution(
      this,
      `${SERVICE}-UnifiedCloudFrontDistribution`,
      {
        comment: `${SERVICE}-${BUILD_STAGE}-unified-distribution`,

        defaultBehavior: {
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          origin: origins.S3BucketOrigin.withOriginAccessIdentity(
            frontendBucket,
            {
              originAccessIdentity,
            }
          ),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        additionalBehaviors: {
          "/users/*/files/*": {
            origin: origins.S3BucketOrigin.withOriginAccessIdentity(
              storageBucket,
              {
                originAccessIdentity,
              }
            ),
            viewerProtocolPolicy:
              cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
            cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
            cachePolicy: originalFileCachePolicy,
          },

          "/users/*/thumbnails/*": {
            origin: origins.S3BucketOrigin.withOriginAccessIdentity(
              storageBucket,
              {
                originAccessIdentity,
              }
            ),
            viewerProtocolPolicy:
              cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
            cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
            cachePolicy: thumbnailCachePolicy,
          },
        },

        defaultRootObject: `index.html`,
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
        ],
        domainNames: undefined,
        certificate: undefined,
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
        env: {
          account: process.env.CDK_DEPLOY_ACCOUNT,
          region: "us-east-1",
        },
      }
    );
    this.distributionDomainName =
      this.cloudfrontDistribution.distributionDomainName;

    // ! CloudFront key pairs must be created manually in the AWS console and cannot be automated through CDK
    new ssm.StringParameter(this, `${SERVICE}-CloudFrontKeyPairIdParameter`, {
      parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/cloudfront_key_pair_id`,
      stringValue: "REPLACE_WITH_ACTUAL_KEY_PAIR_ID",
      description:
        "ID of the CloudFront key pair used for signing URLs and cookies",
    });

    const privateKeySecret = new secretsmanager.Secret(
      this,
      `${SERVICE}-CloudFrontPrivateKeySecret`,
      {
        secretName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/cloudfront_private_key`,
        description:
          "CloudFront private key for signing URLs and cookies (must be updated manually)",
        generateSecretString: {
          secretStringTemplate: JSON.stringify({
            info: "Replace this with the actual private key content from your CloudFront key pair",
          }),
          generateStringKey: "temporaryPlaceholder", // This creates a random value
        },
      }
    );

    new ssm.StringParameter(
      this,
      `${SERVICE}-CloudFrontPrivateKeySecretArnParameter`,
      {
        parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/cloudfront_private_key_secret_arn`,
        stringValue: privateKeySecret.secretArn,
        description: "ARN of the secret containing the CloudFront private key",
      }
    );

    new ssm.StringParameter(
      this,
      `${SERVICE}-CloudFrontDistributionIdParameter`,
      {
        parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/cloudfront_distribution_id`,
        stringValue: this.cloudfrontDistribution.distributionId,
      }
    );

    new ssm.StringParameter(this, `${SERVICE}-CloudFrontDomainNameParameter`, {
      parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/cloudfront_domain_name`,
      stringValue: this.distributionDomainName,
    });
  }
}
