import React from "react";
import {
  FiBell,
  FiCheckCircle,
  FiClock,
  FiFileText,
} from "react-icons/fi";

import "./Notification.css";

const Notification = () => {
  const notifications = [
    {
      id: 1,
      type: "success",
      title: "Form Approved",
      message:
        "Your UG form for 1st semester has been approved by the coordinator.",
      time: "10 minutes ago",
    },
    {
      id: 2,
      type: "pending",
      title: "Request Pending",
      message:
        "Your submitted form is currently waiting for coordinator approval.",
      time: "2 hours ago",
    },
    {
      id: 3,
      type: "info",
      title: "Fee Voucher Uploaded",
      message:
        "Your fee voucher has been successfully uploaded with your UG form.",
      time: "Yesterday",
    },
    {
      id: 4,
      type: "info",
      title: "Profile Updated",
      message:
        "Your student profile information has been updated successfully.",
      time: "2 days ago",
    },
  ];

  const getIcon = (type) => {
    if (type === "success") {
      return <FiCheckCircle />;
    }

    if (type === "pending") {
      return <FiClock />;
    }

    return <FiFileText />;
  };

  return (
    <div className="notification-page">
      <section className="notification-card">

        {/* Header */}
        <div className="notification-header">
          <div>
            <h2>Notifications</h2>
            <p>
              Stay updated with your form requests and account activity.
            </p>
          </div>

          <div className="notification-header-icon">
            <FiBell />
          </div>
        </div>

        {/* Notification List */}
        <div className="notification-list">
          {notifications.map((notification) => (
            <div
              className={`notification-item ${notification.type}`}
              key={notification.id}
            >
              <div className="notification-icon">
                {getIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-title-row">
                  <h3>{notification.title}</h3>

                  <span className="notification-time">
                    {notification.time}
                  </span>
                </div>

                <p>{notification.message}</p>
              </div>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
};

export default Notification;