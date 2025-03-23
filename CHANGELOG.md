# Changelog

All notable changes to this project will be documented in this file.

---

## 0.0.14 - 2025-03-23

### Fixed

- Missmatch in the **COGNITO_USER_POOL_CLIENT_ID** name (`vite.config.js` vs. `frontend/main.jsx`)
- Define environment variables in the `vite.config.js` file

### Added

- Validation in `frontend-vars.sh` file
- Working authentication with Cognito using Amplify in `frontend/js/pages/SignIn.jsx` (LoginPage.jsx)

## 0.0.13 - 2025-03-23

### Changed

- `cognito.mjs`:
    - Explicitly set only the `email` attribute as signInAliases
    - Add fullname to the user attributes (standardAttributes)
    - enhance password policy

## 0.0.12 - 2025-02-12

### Fixed

- remove the policy for the S3 bucket in the `StorageStack` constructor that was failing ('s3:GetObject' etc.)

### Added

- **deploy** and **destroy** npm scripts

### Changed

- simplify the permissions added to SiteBucket for the CloudFront access

## 0.0.11 - 2025-02-11

### Changed

- tweaks in `static-frontend.mjs` file

### Added

- _cloudfront_domain_ ssm parameter in the `FrontendStack` constructor

## 0.0.10 - 2025-02-11

### Added

- Basic React frontend with Amplify

## 0.0.9 - 2025-02-11

### Changed

- ability to create an account with cognito
- _UserPoolEmail_ for the email attribute
- tweaks in the `cognito.mjs` file
- _SES_IDENTITY_ARN_ local variable

## 0.0.8 - 2025-02-11

### Changed

- change overly broad IAM policy for the S3 storage bucket

### Added

- `index.mjs` file to deploy three CDK stacks
- `deploy` script to deploy the CDK stacks
- `destroy` script to destroy the CDK stacks
- `local-vars.sh` file to generate the local environment variables

## 0.0.7 - 2025-02-11

### Fixed

- proper `super()` call in the `FrontendStack` and `StorageStack` constructors
- ssm parameters name starts with `/`

## 0.0.6 - 2025-02-11

### Added

- `cdk.json` file to direct CDK to the stacks

### Changed

- .gitignore file to ignore the `cdk.out/` folder

## 0.0.5 - 2025-02-03

### Added

- Initial frontend definition with React and Amplify

## 0.0.4 - 2025-02-03

### Added

- Initial `deploy` script for deploying the CDK stack

## 0.0.3 - 2025-02-03

### Added

-

## 0.0.2 - 2025-02-03

### Added

- CDK infrastructure for Frontend (S3, CloudFront)
- CDK infrastructure for S3 storage Bucket

## 0.0.1 - 2025-02-03

### Added

- CDK infrastructure for Cognito