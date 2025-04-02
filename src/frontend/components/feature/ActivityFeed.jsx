import React from "react";

/**
 * ActivityFeed component for displaying recent user activities
 */
const ActivityFeed = ({ activities, loading }) => {
  if (loading || !activities) {
    return (
      <div className="activity-feed">
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-list loading">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="activity-item skeleton"></div>
          ))}
        </div>
      </div>
    );
  }

  // If no activities
  if (activities.length === 0) {
    return (
      <div className="activity-feed empty">
        <h2 className="section-title">Recent Activity</h2>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p className="empty-message">No recent activity to display</p>
        </div>
      </div>
    );
  }

  // Get action icon based on action type
  const getActionIcon = (action) => {
    const iconMap = {
      upload: "⬆️",
      download: "⬇️",
      create_folder: "📁",
      rename: "✏️",
      delete: "🗑️",
      move: "📦",
      share: "🔗",
    };

    return iconMap[action] || "🔄";
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

  // Group activities by day
  const groupActivitiesByDay = (activities) => {
    const groups = {
      today: [],
      yesterday: [],
      older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    activities.forEach((activity) => {
      const activityDate = new Date(activity.timestamp);
      const activityDay = new Date(
        activityDate.getFullYear(),
        activityDate.getMonth(),
        activityDate.getDate()
      );

      if (activityDay.getTime() === today.getTime()) {
        groups.today.push(activity);
      } else if (activityDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(activity);
      } else {
        groups.older.push(activity);
      }
    });

    return groups;
  };

  const activityGroups = groupActivitiesByDay(activities);

  // Get action description
  const getActionDescription = (action, itemName) => {
    const actionMap = {
      upload: `Uploaded "${itemName}"`,
      download: `Downloaded "${itemName}"`,
      create_folder: `Created folder "${itemName}"`,
      rename: `Renamed "${itemName}"`,
      delete: `Deleted "${itemName}"`,
      move: `Moved "${itemName}"`,
      share: `Shared "${itemName}"`,
    };

    return actionMap[action] || `Modified "${itemName}"`;
  };

  return (
    <div className="activity-feed">
      <h2 className="section-title">Recent Activity</h2>

      {activityGroups.today.length > 0 && (
        <div className="activity-group">
          <h3 className="group-title">Today</h3>
          <div className="activity-list">
            {activityGroups.today.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {getActionIcon(activity.action)}
                </div>
                <div className="activity-content">
                  <div className="activity-description">
                    {getActionDescription(activity.action, activity.itemName)}
                  </div>
                  <div className="activity-time">
                    {formatRelativeTime(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activityGroups.yesterday.length > 0 && (
        <div className="activity-group">
          <h3 className="group-title">Yesterday</h3>
          <div className="activity-list">
            {activityGroups.yesterday.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {getActionIcon(activity.action)}
                </div>
                <div className="activity-content">
                  <div className="activity-description">
                    {getActionDescription(activity.action, activity.itemName)}
                  </div>
                  <div className="activity-time">
                    {formatRelativeTime(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activityGroups.older.length > 0 && (
        <div className="activity-group">
          <h3 className="group-title">Older</h3>
          <div className="activity-list">
            {activityGroups.older.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {getActionIcon(activity.action)}
                </div>
                <div className="activity-content">
                  <div className="activity-description">
                    {getActionDescription(activity.action, activity.itemName)}
                  </div>
                  <div className="activity-time">
                    {formatRelativeTime(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;