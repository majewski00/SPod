import React from 'react';
import {useAuthenticator} from '@aws-amplify/ui-react';
import { fetchAuthSession } from "aws-amplify/auth";

const MainPage = () => {
    const {user, signOut} = useAuthenticator((context) => [context.user, context.signOut]);

    const handleSignOut = async () => {
        try {
            await signOut({global: true});
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };
    // const test = async () => {
    //     const session = await fetchAuthSession({forceRefresh:true});
    //     console.log("id token", session.tokens.idToken.toString())
    //     // console.log("access token", session.tokens.accessToken)
    // }
    // test()

    return (
        <div className="home-page">
            <header className="header">
                <div className="header-content">
                    <h1>My App</h1>
                    <div className="user-section">
                        <span>Welcome, {user?.username || 'User'}</span>
                        <button
                            onClick={handleSignOut}
                            className="logout-button"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <h2>Home Page</h2>
                <p>You are now logged in. This is your application content.</p>
            </main>

            <style jsx>{`
                .header {
                    background-color: #f8f9fa;
                    padding: 1rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .user-section {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .logout-button {
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                }

                .logout-button:hover {
                    background-color: #c82333;
                }

                .main-content {
                    max-width: 1200px;
                    margin: 2rem auto;
                    padding: 0 1rem;
                }
            `}</style>
        </div>
    );
};

export default MainPage;