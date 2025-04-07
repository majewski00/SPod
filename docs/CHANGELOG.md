# Changelog

All notable changes to this project will be documented in this file.

---

## 0.1.4 - 2025-04-07

### Added

- Added dependency (currentFolder.id) to `useAsync` in `useRetrieveItems.js`
- `Breadcrumbs.jsx` component
- functions that facilitate navigation in `FolderContext.jsx`
- Embedded `Breadcrumbs` feature in `ItemListView.jsx` for complete navigation.

### Changed

- Redesign DDB key structure
- Final rename: `ItemListView.jsx`

### Fixed

- in `FolderContext.jsx` implemented `useEffect` with `location.pathname` dependency to cover reloads and navigation arrows. Additionally, protected by API endpoint that allows to find folder ID, knowing only relative URL path.

## 0.1.3 - 2025-04-06

### Added

- Light animation of welcoming message `HelloUser.jsx` with wait dependency on ready attributes (`useUserAttributes.js`)

### Changed

- Redesign of `HomePage.jsx` to use new features and MUI components
- `userAttributesReady` in `useUserAttributes.js` hook to avoid displaying "Loading..." message

## 0.1.2 - 2025-04-06

### Added

- `CreateFolderModal.jsx` to query a folder name from the user upon creation
- API route "FOLDER_FIND" that will helpfully help resolve **TODO** from `FolderContext.jsx`

### Changed

- Redesign DDB GSI key structure
- Encode and decode "itemPath" passed to API

## 0.1.1 - 2025-04-06

### Added

- salient feature `ItemListView.jsx` (prev. `RecentFiles.jsx`) complete redesign to correctly display all files and folders (including sorting, data conversion, selection of files)
- Hook to retrieve items in given folder `useRetrieveItems.js`
- Common component `ItemActions.jsx` with **Upload** and **Create folder** buttons

### Changed

- Remove files that do not reflect on end goal: `ActivityFeed.jsx`, `QuickAccess.jsx`, `QuickStats.jsx`
- Remove `useDashboardData.js` -||-

## 0.1.0 - 2025-04-05

### Added

- Include "Menu" button in `Header.jsx` to interact with *Navigation Drawer*
- `contexts/FolderContext.jsx` to interact with currently opened folder

### Changed

- Redesign `Header.jsx`
- Total redesign of `Navigation.jsx` with animated drawer functionality
- finally activated Prettier for jsx extension (main.jsx)

### Fixed

- Use `switch` syntax in `routes/index.jsx` to avoid issues with routes ("/home/*" was being redirected back to home)

## 0.0.29 - 2025-04-03

### Added

- Dedicated hook to fetch user attributes using `fetchUserAttributes` in `/hooks/useUserAttributes.js`

### Changed

- Use new `useUserAttributes` in `useDashboardData` and `/layout/Header.jsx`

## 0.0.28 - 2025-04-03

### Added

- "Global Secondary Index" ("GSI") in DDB to enhance key structure

### Changed

- DDB structure in `/api/files.js` and `/api/folders.js` to utilize GSI

### Fixed

- correctly reference userID (*res.locals.user.sub*) in backend
- Rollback from version "0.0.20": *authorizer.ref* <-- authorizerId
- correct env variable "S3_STORAGE_BUCKET_NAME" in `/helpers/s3-signed-url.js`

## 0.0.27 - 2025-04-02

### Fixed

- use `useRef` in `useAsync.js` to avoid re-rendering at every frame
- correct how "idToken" is extracted from `fetchAuthSession` in `apiHandlers.js` 

## 0.0.26 - 2025-04-02

### Added

- `styles/global.css`
- import css file in `main.jsx`
- "constants" alias, "VITE_API_BASE_URL" definition in `vite.config.js`

### Fixed

- Return null instead of HTML text from `handleResponse` in `apiHandlers.js`
- proxy in `vite.config.js` to redirect api calls to port 3000

## 0.0.25 - 2025-04-02

### Added

- General `useAsync.js` hook
- `useDashBoardData.js` hook for Home Page
- Minimal `HomePage.jsx` for initial testings

### Changed

- Updated `routes/index.jsx` to implement routes, apply new HomePage, and remove comments

## 0.0.24 - 2025-04-02

### Added

- Minimal PoC of HomePage
- Feature components like: `ActivityFeed.jsx`, `QuickAccess.jsx`, `RecentFiles.jsx`, etc.
- Layout components like: `Header.jsx` and `Navigation.jsx`

## 0.0.23 - 2025-03-31

### Added

- `apiHandlers` to facilitate adding attaching valid token, building URL, and parsing response
- `services/api/` to hold predefined functions for every API endpoint (`services/api/files.js` and `services/api/folders.js`)

### Fixed

- missing `COGNITO_USER_POOL_ID` env variable in `api/serverless.yml`

## 0.0.22 - 2025-03-31

### Changed

- Structure of `src/frontend` to align with standards
- Default values in Amplify "Create Account" are *Email* and *Full Name*
- Removed *Username* field in Amplify "Create Account"
- Experiment with URL structure "/auth/" and "/home/"

### Fixed

- Added `alias` field in `vite.config.js` to properly find `index.html` and `app.jsx`

## 0.0.21 - 2025-03-31

### Added

- add "cognito-express" to `backend/api/app.js` to (again) validate user and extract user info into *res.locals.user*

## 0.0.20 - 2025-03-30

### Changed

- format `cognito.mjs` with Prettier
- *authorizer.ref* --> authorizerId
- systematization of files' paths in `backend/api/`

### Added

- Toy endpoint for local testing: `files/checkout`

## 0.0.19 - 2025-03-30

### Changed

- Setup Serverless to use built-in ESbuild with `esbuild.config.js`
- Remove "serverless-esbuild" from devDependencies

### Fixed

- Missing "self:" syntax in `serverless.yml`

## 0.0.18 - 2025-03-29

### Added

- First APIs: `files.js`, `folders.js` routes
- `backend/api/serverless.yml` file (using ESbuild) and handler for serverless-express in `lambda.js`
- `constants` folder with `routes.js` and `s3-signed-url.js` functions

### Changed

- missing deps in `package.json`

## 0.0.17 - 2025-03-29

### Changed

- Clean-up project structure: `scripts/` `docs/`
- Proper formatting with Prettier in `infrastructure/`

### Added

- DynamoDB CDK Stack

## 0.0.16 - 2025-03-24

### Added

- Add CDK stack for API Gateway

## 0.0.15 - 2025-03-23

### Changed

- Enhance `deploy.sh` and `destroy.sh` scripts

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