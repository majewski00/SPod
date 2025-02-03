import React from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import {Amplify} from 'aws-amplify'
import {Authenticator, View} from '@aws-amplify/ui-react'
import Routes from './js/routes'


const urls = ["http://localhost:4000"]
const url = urls[0]

Amplify.configure({
    Auth: {
        Cognito: {
            loginWith: {
                oauth: {
                    domain: process.env.COGNITO_DOMAIN,
                    redirectSignIn: [url],
                    redirectSignOut: [url],
                    responseType: 'code',
                    scopes: ['email', 'openid', 'aws.cognito.signin.user.admin', 'profile']
                }
            },
            region: process.env.AWS_REGION,
            userPoolClientId: process.env.COGNITO_USER_POOL_APP_CLIENT_ID,
            userPoolId: process.env.COGNITO_USER_POOL_ID
        }
    }
})

const root = createRoot(document.getElementById('root'))
root.render(
    <BrowserRouter>
        <Authenticator.Provider>
            <View>
                <Routes/>
            </View>
        </Authenticator.Provider>
    </BrowserRouter>
)
