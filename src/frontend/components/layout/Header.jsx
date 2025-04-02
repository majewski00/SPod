import React from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";

/**
 * Header component for the application
 * Contains logo, search bar, and user profile menu
 */
const Header = () => {
  const { user, signOut } = useAuthenticator((context) => [
    context.user,
    context.signOut,
  ]);

  return (
    <header className="app-header">
      <div className="logo">
        <h1>SPod</h1>
      </div>
      
      <div className="search-container">
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search files and folders..." 
        />
        <button className="search-button">
          <span className="search-icon">🔍</span>
        </button>
      </div>
      
      <div className="user-menu">
        <button className="upload-button">
          <span className="upload-icon">+</span>
          <span>Upload</span>
        </button>
        
        <div className="profile-dropdown">
          <div className="profile-trigger">
            <div className="avatar">
              {user?.username.charAt(0) || "U"}
            </div>
            <span className="username">{user?.username || "User"}</span>
          </div>
          
          <div className="dropdown-menu">
            <ul>
              <li>
                <a href="/profile">Profile</a>
              </li>
              <li>
                <a href="/settings">Settings</a>
              </li>
              <li>
                <button onClick={signOut}>Sign Out</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;