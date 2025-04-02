import React from "react";
import { signOut } from "aws-amplify/auth";
import Header from "../components/layout/Header";
import Navigation from "../components/layout/Navigation";
import QuickStats from "../components/feature/QuickStats";
import RecentFiles from "../components/feature/RecentFiles";
import QuickAccess from "../components/feature/QuickAccess";
import ActivityFeed from "../components/feature/ActivityFeed";
import { useDashboardData } from "../hooks/useDashboardData";

/**
 * HomePage component - main dashboard view after authentication
 */
const HomePage = () => {  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  const {
    userName,
    rootItems,
    recentFiles,
    storageStats,
    activityData,
    loading,
    error,
    reload
  } = useDashboardData();

  return (
    <div className="app-container">
      {error && (
        <div className="error-popup">
          <div className="error-popup-content">
            <div className="error-popup-icon">⚠️</div>
            <div className="error-popup-message">
              <p className="error-title">Error Loading Data</p>
              <p className="error-details">{error.message || "There was an error loading your dashboard data."}</p>
            </div>
            <button className="error-popup-retry" onClick={reload}>
              Retry
            </button>
            <button className="error-popup-close" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      )}
      <Header />
      
      <div className="app-content">
        <Navigation storageStats={storageStats} />
        
        <main className="main-content">
          <div className="welcome-section">
            <h1 className="welcome-message">
              Welcome back, {userName}!
            </h1>
          </div>
          
          <QuickStats stats={storageStats} />
          
          <div className="dashboard-grid">
            <div className="dashboard-column main-column">
              <RecentFiles files={recentFiles} loading={loading} />
              <QuickAccess folders={rootItems?.filter(item => item.isFolder)} loading={loading} />
            </div>
            
            <div className="dashboard-column side-column">
              <ActivityFeed activities={activityData} loading={loading} />
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
};

export default HomePage;