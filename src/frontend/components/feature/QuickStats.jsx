import React from "react";

/**
 * QuickStats component for displaying storage and file statistics
 */
const QuickStats = ({ stats }) => {
  if (!stats) {
    return (
      <div className="quick-stats loading">
        <div className="stat-card skeleton"></div>
        <div className="stat-card skeleton"></div>
        <div className="stat-card skeleton"></div>
      </div>
    );
  }

  // Format bytes to human-readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Calculate storage percentage
  const storagePercentage = Math.min(
    Math.round((stats.storageUsed / stats.storageLimit) * 100),
    100
  );

  return (
    <div className="quick-stats">
      <div className="stat-card files-count">
        <div className="stat-icon">📄</div>
        <div className="stat-content">
          <h3 className="stat-title">Files</h3>
          <div className="stat-value">{stats.totalFiles}</div>
          <div className="stat-description">
            {stats.totalFolders} folders
          </div>
        </div>
      </div>

      <div className="stat-card storage-used">
        <div className="stat-icon">💾</div>
        <div className="stat-content">
          <h3 className="stat-title">Storage Used</h3>
          <div className="stat-value">
            {formatBytes(stats.storageUsed)}
          </div>
          <div className="storage-bar">
            <div
              className="storage-fill"
              style={{ width: `${storagePercentage}%` }}
            ></div>
          </div>
          <div className="stat-description">
            {storagePercentage}% of {formatBytes(stats.storageLimit)}
          </div>
        </div>
      </div>

      <div className="stat-card activity-summary">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <h3 className="stat-title">Recent Activity</h3>
          <div className="stat-value">4</div>
          <div className="stat-description">
            actions in the last 24 hours
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
