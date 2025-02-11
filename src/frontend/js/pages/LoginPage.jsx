import React from 'react';
import {Authenticator} from '@aws-amplify/ui-react';

const LoginPage = () => {
    return (
        <Authenticator
            loginMechanism={'email'}
        />
    );
};

export default LoginPage;