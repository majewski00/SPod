import React from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import {Amplify} from 'aws-amplify'
import {Authenticator, View} from '@aws-amplify/ui-react'
import AppRoutes from "./routes";
import './styles/global.css'


const urls = ["http://localhost:4000"]
const url = urls[0]

console.log(`COGNITO_DOMAIN: ${process.env.COGNITO_DOMAIN}\nAWS_REGION: ${process.env.AWS_REGION}\nCOGNITO_USER_POOL_CLIENT_ID: ${process.env.COGNITO_USER_POOL_CLIENT_ID}\nCOGNITO_USER_POOL_ID: ${process.env.COGNITO_USER_POOL_ID}`)
Amplify.configure({
    Auth: {
        Cognito: {
            userPoolClientId: process.env.COGNITO_USER_POOL_CLIENT_ID,
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
            userPoolId: process.env.COGNITO_USER_POOL_ID
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
