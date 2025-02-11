import React, {lazy, Suspense} from 'react';
import {useAuthenticator} from '@aws-amplify/ui-react';
import LoaderPage from "../pages/LoaderPage";

// Lazy load the page components
const LoginPage = lazy(() => import('../pages/LoginPage'));
const HomePage = lazy(() => import('../pages/HomePage'));

const AppRoutes = () => {
    const {authStatus} = useAuthenticator((context) => {
        return [context.authStatus]
    })

    switch (authStatus) {
        case "authenticated":
            console.log("authenticated")
            return (
                <Suspense fallback={<LoaderPage/>}>
                    <HomePage/>
                </Suspense>
            )
        case "configuring":
            console.log("configuring")
            return <LoaderPage/>

        default:
            console.log("Authentication required")
            return (
                <Suspense fallback={<LoaderPage/>}>
                    <LoginPage/>
                </Suspense>)
    }
}

export default AppRoutes