import {readFileSync} from 'fs'
import {join} from 'path'
import * as cdk from 'aws-cdk-lib'
import {StorageS3Stack} from './s3.mjs'
import {FrontendStack} from './static-frontend.mjs'
import {CognitoStack} from './cognito.mjs'

const SERVICE = process.env.SERVICE
const BUILD_STAGE = process.env.BUILD_STAGE
const AWS_REGION = process.env.AWS_REGION

const app = new cdk.App()
const localPackageJson = JSON.parse(readFileSync(join(process.cwd(), '../../package.json'), 'utf8'))

const frontend = new FrontendStack(app, `${id}-FrontendStack`, {
    version: localPackageJson.version,
    env: {
        account: process.env.CDK_DEPLOY_ACCOUNT,
        region: AWS_REGION
    },
    terminationProtection: false
})
const s3 = new StorageS3Stack(app, `${id}-StorageS3Stack`, {
    version: localPackageJson.version,
    env: {
        account: process.env.CDK_DEPLOY_ACCOUNT,
        region: AWS_REGION
    },
    terminationProtection: false
})
const cognito = new CognitoStack(app, `${id}-CognitoStack`, {
    version: localPackageJson.version,
    env: {
        account: process.env.CDK_DEPLOY_ACCOUNT,
        region: AWS_REGION
    },
    terminationProtection: false
})

cdk.Tags.of(app).add('Stage', BUILD_STAGE)
cdk.Tags.of(app).add('Region', AWS_REGION)
cdk.Tags.of(app).add('Service', SERVICE)
cdk.Tags.of(app).add('Version', localPackageJson.version)
cdk.Tags.of(app).add('Managed By', 'CDK')
