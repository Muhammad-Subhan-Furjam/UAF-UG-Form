import React from "react";
import {
  FiBell,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiAlertCircle,
} from "react-icons/fi";

import "./CoordinatorAlerts.css";

const CoordinatorAlerts = () => {
  const notifications = [
    {
      id: 1,
      type: "request",
      title: "New UG Form Request",
      message:
        "A new UG form request has been submitted by student 2022-AG-5555.",
      time: "10 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "approved",
      title: "Request Approved",
      message:
        "UG-2026-1234 has been successfully approved.",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      type: "pending",
      title: "Pending Requests",
      message:
        "You currently have 8 UG form requests waiting for review.",
      time: "Today",
      unread: false,
    },
    {
      id: 4,
      type: "course",
      title: "Course Information Updated",
      message:
        "Course details for Computer Science have been updated.",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 5,
      type: "alert",
      title: "Action Required",
      message:
        "Please review pending student requests before the submission deadline.",
      time: "2 days ago",
      unread: false,
    },
  ];

  const getNotificationIcon = (type) => {
    if (type === "approved") {
      return <FiCheckCircle />;
    }

    if (type === "pending") {
      return <FiClock />;
    }

    if (type === "course") {
      return <FiFileText />;
    }

    if (type === "alert") {
      return <FiAlertCircle />;
    }

    return <FiBell />;
  };

  return (
    <div className="coordinator-alerts-page">

      <section className="coordinator-alerts-card">

        {/* HEADER */}
        <div className="coordinator-alerts-header">
          <div>
            <h2>Notifications</h2>

            <p>
              Stay updated with student requests and coordinator activity.
            </p>
          </div>

          <div className="coordinator-main-bell">
            <FiBell />
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="coordinator-alerts-list">

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`coordinator-alert-item ${
                notification.unread ? "unread" : ""
              }`}
            >
              <div
                className={`coordinator-alert-icon ${notification.type}`}
              >
                {getNotificationIcon(notification.type)}
              </div>

              <div className="coordinator-alert-content">

                <div className="coordinator-alert-title-row">

                  <div className="coordinator-alert-title-area">
                    <h3>{notification.title}</h3>

                    {notification.unread && (
                      <span className="coordinator-unread-dot"></span>
                    )}
                  </div>

                  <span className="coordinator-alert-time">
                    {notification.time}
                  </span>

                </div>

                <p>
                  {notification.message}
                </p>

              </div>
            </div>
          ))}

        </div>

      </section>

    </div>
  );
};

export default CoordinatorAlerts;