import React from "react";

/**
 * RecentFiles component for displaying recently accessed files
 */
const RecentFiles = ({ files, loading }) => {
  if (loading || !files) {
    return (
      <div className="recent-files">
        <h2 className="section-title">Recent Files</h2>
        <div className="files-carousel loading">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="file-card skeleton"></div>
          ))}
        </div>
      </div>
    );
  }

  // If no recent files
  if (files.length === 0) {
    return (
      <div className="recent-files empty">
        <h2 className="section-title">Recent Files</h2>
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <p className="empty-message">No recent files to display</p>
        </div>
      </div>
    );
  }

  // Get file icon based on file type
  const getFileIcon = (fileType) => {
    const iconMap = {
      pdf: "📕",
      doc: "📘",
      docx: "📘",
      xls: "📗",
      xlsx: "📗",
      ppt: "📙",
      pptx: "📙",
      txt: "📄",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      mp3: "🎵",
      mp4: "🎬",
    };

    const extension = fileType?.toLowerCase().split("/").pop();
    return iconMap[extension] || "📄";
  };

  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return diffDay === 1 ? "Yesterday" : `${diffDay} days ago`;
    }
    if (diffHour > 0) {
      return `${diffHour} ${diffHour === 1 ? "hour" : "hours"} ago`;
    }
    if (diffMin > 0) {
      return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;
    }
    return "Just now";
  };

  return (
    <div className="recent-files">
      <h2 className="section-title">Recent Files</h2>
      <div className="files-carousel">
        {files.map((file) => (
          <div key={file.id} className="file-card">
            <div className="file-thumbnail">
              {file.thumbnailUrl ? (
                <img
                  src={file.thumbnailUrl}
                  alt={file.name}
                  className="thumbnail-image"
                />
              ) : (
                <div className="file-icon">{getFileIcon(file.type)}</div>
              )}
            </div>
            <div className="file-info">
              <div className="file-name" title={file.name}>
                {file.name}
              </div>
              <div className="file-meta">
                {formatRelativeTime(file.modifiedAt)}
              </div>
            </div>
            <div className="file-actions">
              <button className="action-button download" title="Download">
                ⬇️
              </button>
              <button className="action-button rename" title="Rename">
                ✏️
              </button>
              <button className="action-button delete" title="Delete">
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentFiles;