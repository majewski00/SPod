import React from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import {Amplify} from 'aws-amplify'
import {Authenticator, View} from '@aws-amplify/ui-react'
import AppRoutes from "./js/routes";


const urls = ["http://localhost:4000"]
const url = urls[0]

Amplify.configure({
    Auth: {
        Cognito: {
            loginWith: {
                oauth: {
                    domain: import.meta.env.COGNITO_DOMAIN,
                    redirectSignIn: [url],
                    redirectSignOut: [url],
                    responseType: 'code',
                    scopes: ['email', 'openid', 'aws.cognito.signin.user.admin', 'profile']
                }
            },
            region: import.meta.env.AWS_REGION,
            userPoolClientId: import.meta.env.COGNITO_USER_POOL_APP_CLIENT_ID,
            userPoolId: import.meta.env.COGNITO_USER_POOL_ID
        }
    }
})

const root = createRoot(document.getElementById('root'))
root.render(
    <BrowserRouter>
        <Authenticator.Provider>
            <View>
                <AppRoutes/>
            </View>
        </Authenticator.Provider>
    </BrowserRouter>
)
