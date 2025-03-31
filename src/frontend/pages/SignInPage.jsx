import React from 'react';
import {Authenticator, Heading, Text, useAuthenticator, useTheme, View} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

// const logo = '/path/to/your/logo.png'; TODO

const components = {
    Header() {
        const {tokens} = useTheme();

        return (
            <View textAlign="center" padding={tokens.space.large}>
                {/*{logo && <Image alt="App logo" src={logo} />}*/}
                <Heading level={3} padding={`${tokens.space.xl} 0`}>
                    Welcome to Your App
                </Heading>
            </View>
        );
    },

    Footer() {
        const {tokens} = useTheme();

        return (
            <View textAlign="center" padding={tokens.space.medium}>
                <Text color={tokens.colors.neutral[80]}>
                    &copy; {new Date().getFullYear()} Your Company. All Rights Reserved.
                </Text>
            </View>
        );
    },
};

const SignInPage = () => {
    const {route, error} = useAuthenticator(context => [context.route, context.error]);
    console.log('Current auth route:', route);
    if (error) {
        console.error('Authenticator error:', error);
    }
    return (
        <View className="auth-wrapper">
            <Authenticator
                initialState="signIn"
                components={components}
                socialProviders={['google', 'facebook', 'amazon']}
                formFields={{
                    signUp: {
                        email: {
                            label: 'Email',
                            placeholder: 'Enter your email',
                            isRequired: true,
                            order: 1
                        },
                        name: {
                            label: 'Full Name',
                            placeholder: 'Enter your full name',
                            isRequired: true,
                            order: 2
                        }
                    }
                }}
                loginMechanisms={['email']}
            />
        </View>
    );
};

export default SignInPage;
