import React from "react";
import { Link } from "react-router-dom";

/**
 * QuickAccess component for displaying pinned folders
 */
const QuickAccess = ({ folders, loading }) => {
  // Mock folders for initial implementation
  const mockFolders = [
    { id: "folder1", name: "Documents", itemCount: 24 },
    { id: "folder2", name: "Images", itemCount: 156 },
    { id: "folder3", name: "Projects", itemCount: 8 },
    { id: "folder4", name: "Backups", itemCount: 3 },
  ];

  const displayFolders = folders || mockFolders;

  if (loading) {
    return (
      <div className="quick-access">
        <h2 className="section-title">Quick Access</h2>
        <div className="folders-grid loading">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="folder-card skeleton"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="quick-access">
      <h2 className="section-title">Quick Access</h2>
      <div className="folders-grid">
        {displayFolders.map((folder) => (
          <Link
            to={`/files/${folder.id}`}
            key={folder.id}
            className="folder-card"
          >
            <div className="folder-icon">📁</div>
            <div className="folder-info">
              <div className="folder-name">{folder.name}</div>
              <div className="folder-meta">
                {folder.itemCount} {folder.itemCount === 1 ? "item" : "items"}
              </div>
            </div>
          </Link>
        ))}
        
        <div className="add-quick-access">
          <div className="add-icon">+</div>
          <div className="add-label">Add Folder</div>
        </div>
      </div>
    </div>
  );
};

export default QuickAccess;