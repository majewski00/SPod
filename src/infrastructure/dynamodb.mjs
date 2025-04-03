import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ssm from "aws-cdk-lib/aws-ssm";

export class DynamoDBStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const SERVICE = process.env.SERVICE;
    const BUILD_STAGE = process.env.BUILD_STAGE;
    const AWS_REGION = process.env.AWS_REGION;

    const dynamoDBTable = new dynamodb.Table(this, `${SERVICE}-main`, {
      tableName: `${SERVICE}-${BUILD_STAGE}-main`,
      partitionKey: {
        name: "PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: dynamodb.AttributeType.STRING,
      },
      timeToLiveAttribute: "ttl",
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      deletionProtection: true,
    });

    dynamoDBTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: {
        name: "GSI1PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "GSI1SK",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    new ssm.StringParameter(this, `${SERVICE}-DynamoDBTableNameParameter`, {
      parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/dynamodb_table_name`,
      stringValue: dynamoDBTable.tableName,
    });
    new ssm.StringParameter(this, `${SERVICE}-DynamoDBTableArnParameter`, {
      parameterName: `/${SERVICE}/${BUILD_STAGE}/${AWS_REGION}/dynamodb_table_arn`,
      stringValue: dynamoDBTable.tableArn,
    });
  }
}
