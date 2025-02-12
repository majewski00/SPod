import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as ssm from 'aws-cdk-lib/aws-ssm'

export class StorageS3Stack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);

        const SERVICE = process.env.SERVICE
        const BUILD_STAGE = process.env.BUILD_STAGE
        const AWS_REGION = process.env.AWS_REGION

        const storageBucket = new s3.Bucket(this, `${SERVICE}-storage-bucket`, {
            bucketName: `${SERVICE}-${BUILD_STAGE}-storage-bucket`,
            // removalPolicy: cdk.RemovalPolicy.RETAIN,
            versioned: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        })

        storageBucket.addToResourcePolicy(
            new cdk.aws_iam.PolicyStatement({
                actions: ['*'],
                resources: [storageBucket.bucketArn, `${storageBucket.bucketArn}/*`],
                principals: [new cdk.aws_iam.AnyPrincipal()],
                effect: cdk.aws_iam.Effect.DENY,
                conditions: {
                    Bool: {
                        'aws:SecureTransport': 'false'
                    }
                },
                sid: 'DenyUnSecureTransport'
            })
        )
        // TODO: Add CORS (Cross-Origin Resource Sharing) policy to the S3 bucket for local development

        new ssm.StringParameter(this, `${SERVICE}-StorageS3BucketIdParameter`, {
            parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/storage_s3_bucket_id`,
            stringValue: storageBucket.bucketName
        })
        new ssm.StringParameter(this, `${SERVICE}-StorageS3BucketArnParameter`, {
            parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/storage_s3_bucket_arn`,
            stringValue: storageBucket.bucketArn
        })
    }
}