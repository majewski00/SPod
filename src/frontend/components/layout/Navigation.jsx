import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Navigation component for the left sidebar
 * Contains navigation links and storage meter
 */
const Navigation = ({ storageStats }) => {
  const location = useLocation();
  const [folderTreeExpanded, setFolderTreeExpanded] = useState(false);

  // Calculate storage percentage
  const storagePercentage = storageStats
    ? Math.min(
        Math.round((storageStats.storageUsed / storageStats.storageLimit) * 100),
        100
      )
    : 0;

  // Format bytes to human-readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const navItems = [
    { path: "/home", label: "Home", icon: "🏠" },
    { path: "/files", label: "My Files", icon: "📁" },
    { path: "/recent", label: "Recent", icon: "🕒" },
    { path: "/shared", label: "Shared", icon: "👥" },
    { path: "/trash", label: "Trash", icon: "🗑️" },
  ];

  return (
    <nav className="app-navigation">
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.path} className="nav-item">
            <Link
              to={item.path}
              className={`nav-link ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="divider"></div>

      <div className="storage-section">
        <h3 className="storage-title">Storage</h3>
        <div className="storage-meter">
          <div className="storage-bar">
            <div
              className="storage-fill"
              style={{ width: `${storagePercentage}%` }}
            ></div>
          </div>
          <div className="storage-info">
            <span className="storage-used">
              {storageStats
                ? formatBytes(storageStats.storageUsed)
                : "-- GB"}
            </span>
            <span className="storage-total">
              {storageStats
                ? formatBytes(storageStats.storageLimit)
                : "-- GB"}
            </span>
          </div>
          <div className="storage-percentage">{storagePercentage}% used</div>
        </div>
      </div>

      <div className="folder-tree-section">
        <button
          className="folder-tree-toggle"
          onClick={() => setFolderTreeExpanded(!folderTreeExpanded)}
        >
          <span className="toggle-icon">
            {folderTreeExpanded ? "▼" : "►"}
          </span>
          <span className="toggle-label">Folder Tree</span>
        </button>
        
        {folderTreeExpanded && (
          <div className="folder-tree">
            {/* Folder tree would be implemented here */}
            <ul className="tree-list">
              <li className="tree-item">
                <span className="folder-icon">📁</span>
                <span className="folder-name">Documents</span>
              </li>
              <li className="tree-item">
                <span className="folder-icon">📁</span>
                <span className="folder-name">Images</span>
              </li>
              <li className="tree-item">
                <span className="folder-icon">📁</span>
                <span className="folder-name">Projects</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;