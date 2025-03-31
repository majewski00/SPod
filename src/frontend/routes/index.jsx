import React, {lazy, Suspense} from 'react';
import {useAuthenticator} from '@aws-amplify/ui-react';
import {Routes, Route, Navigate} from 'react-router-dom';
import LoaderPage from "../pages/LoaderPage";

// Lazy load the page components
const LoginPage = lazy(() => import('../pages/SignInPage'));
const MainPage = lazy(() => import('../pages/MainPage'));

const AppRoutes = () => {
    const {authStatus} = useAuthenticator((context) => {
        return [context.authStatus]
    })

    // switch (authStatus) {
    //     case "authenticated":
    //         console.log("authenticated")
    //         return (
    //             <Suspense fallback={<LoaderPage/>}>
    //                 <MainPage/>
    //             </Suspense>
    //         )
    //     case "configuring":
    //         console.log("configuring")
    //         return <LoaderPage/>

    //     default:
    //         console.log("Authentication required")
    //         return (
    //             <Suspense fallback={<LoaderPage/>}>
    //                 <LoginPage/>
    //             </Suspense>)
    // }
    return (
            <Suspense fallback={<LoaderPage/>}>
                <Routes>
                    {authStatus === "authenticated" ? (
                        <>
                            <Route path="/home" element={<MainPage/>}/>
                            <Route path="*" element={<Navigate to="/home" replace/>}/>
                        </>
                    ) : (
                        <>
                            <Route path="/auth" element={<LoginPage/>}/>
                            <Route path="*" element={<Navigate to="/auth" replace/>}/>
                        </>
                    )}
                </Routes>
            </Suspense>
    );
}

export default AppRoutes
