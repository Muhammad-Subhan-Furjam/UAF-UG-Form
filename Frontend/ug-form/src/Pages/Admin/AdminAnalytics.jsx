import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiUserCheck, FiFileText, FiBookOpen, FiActivity, FiGlobe, FiRefreshCw } from "react-icons/fi";
import api from "../../api/api";
import "./AdminAnalytics.css";

const AdminAnalytics = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    studentsCount: 0,
    coordinatorsCount: 0,
    formsCount: 0,
    coursesCount: 0,
    activeUsersCount: 0,
    activeStudentsCount: 0,
    activeCoordinatorsCount: 0,
    activeSuperAdminsCount: 0,
    activeUsersList: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStats = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else if (!stats.activeUsersList.length) setLoading(true);

      setErrorMsg("");
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch analytics stats:", error);
      setErrorMsg(
        error.response?.data?.message || "Session error. Please log in again at /ladmin."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh active users & IPs every 15 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeUsers = stats.activeUsersList || [];

  const filteredActiveUsers = activeUsers.filter((u) => {
    const roleLower = (u.role || "").toLowerCase();
    if (roleFilter === "student" && roleLower !== "student") return false;
    if (roleFilter === "coordinator" && roleLower !== "coordinator") return false;
    if (roleFilter === "superadmin" && roleLower !== "superadmin") return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.agNumber && u.agNumber.toLowerCase().includes(q)) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(q)) ||
      (u.ip && u.ip.includes(q))
    );
  });

  return (
    <div className="admin-analytics-page">
      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2>System Statistics & Live User Analytics</h2>
          <p>Real-time system telemetry, active online user counters, and connection IP monitoring.</p>
        </div>

        <button
          type="button"
          className="quick-action-btn secondary"
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 14px" }}
        >
          <FiRefreshCw className={refreshing ? "spin-icon" : ""} size={14} />
          {refreshing ? "Updating Live IPs..." : "Refresh Live Tracker"}
        </button>
      </div>

      {errorMsg && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", border: "1px solid #fecaca", fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading statistics & live user tracking...</p>
      ) : (
        <>
          {/* ANALYTICS METRIC CARDS GRID */}
          <div className="admin-analytics-grid">
            {/* TOTAL ACTIVE ONLINE USERS */}
            <div className="analytics-stat-card" style={{ borderTop: "4px solid #0d9488" }}>
              <div style={{ color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <FiActivity size={24} />
                <span className="live-pulse-badge">
                  <span className="pulse-dot"></span> LIVE ONLINE
                </span>
              </div>
              <div>
                <h3>{stats.activeUsersCount || 0}</h3>
                <p>Total Active Online Users</p>
              </div>
            </div>

            {/* ACTIVE ONLINE STUDENTS */}
            <div className="analytics-stat-card" style={{ borderTop: "4px solid #2563eb" }} onClick={() => setRoleFilter("student")}>
              <div style={{ color: "#2563eb", marginBottom: "10px" }}><FiUsers size={24} /></div>
              <div>
                <h3>{stats.activeStudentsCount || 0}</h3>
                <p>Active Online Students</p>
              </div>
            </div>

            {/* ACTIVE ONLINE COORDINATORS */}
            <div className="analytics-stat-card" style={{ borderTop: "4px solid #16a34a" }} onClick={() => setRoleFilter("coordinator")}>
              <div style={{ color: "#16a34a", marginBottom: "10px" }}><FiUserCheck size={24} /></div>
              <div>
                <h3>{stats.activeCoordinatorsCount || 0}</h3>
                <p>Active Online Coordinators</p>
              </div>
            </div>

            {/* TOTAL REGISTERED STUDENTS */}
            <div className="analytics-stat-card" style={{ borderTop: "4px solid #9333ea" }} onClick={() => navigate("/admin/students")}>
              <div style={{ color: "#9333ea", marginBottom: "10px" }}><FiUsers size={24} /></div>
              <div>
                <h3>{stats.studentsCount}</h3>
                <p>Registered Students</p>
              </div>
            </div>

            {/* TOTAL REGISTERED COORDINATORS */}
            <div className="analytics-stat-card" style={{ borderTop: "4px solid #ea580c" }} onClick={() => navigate("/admin/coordinators")}>
              <div style={{ color: "#ea580c", marginBottom: "10px" }}><FiUserCheck size={24} /></div>
              <div>
                <h3>{stats.coordinatorsCount}</h3>
                <p>Registered Coordinators</p>
              </div>
            </div>

            {/* UG FORM SUBMISSIONS */}
            <div className="analytics-stat-card" style={{ borderTop: "4px solid #4f46e5" }} onClick={() => navigate("/admin/forms")}>
              <div style={{ color: "#4f46e5", marginBottom: "10px" }}><FiFileText size={24} /></div>
              <div>
                <h3>{stats.formsCount}</h3>
                <p>UG Form Submissions</p>
              </div>
            </div>

            {/* ACADEMIC COURSES */}
            <div className="analytics-stat-card" style={{ borderTop: "4px solid #d97706" }} onClick={() => navigate("/admin/courses")}>
              <div style={{ color: "#d97706", marginBottom: "10px" }}><FiBookOpen size={24} /></div>
              <div>
                <h3>{stats.coursesCount}</h3>
                <p>System Academic Courses</p>
              </div>
            </div>
          </div>

          {/* =========================================
              LIVE ACTIVE USERS & IP ADDRESS TRACKER TABLE
          ========================================= */}
          <div className="admin-quick-actions-card" style={{ marginTop: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "15px" }}>
              <div>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiGlobe style={{ color: "#2563eb" }} /> Live Active Users & IP Address Monitoring System
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                  Real-time active student & coordinator session tracker displaying user details and connection IP addresses.
                </p>
              </div>

              {/* ROLE FILTER TABS */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setRoleFilter("all")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1px solid #cbd5e1",
                    background: roleFilter === "all" ? "#082f5c" : "#ffffff",
                    color: roleFilter === "all" ? "#ffffff" : "#334155"
                  }}
                >
                  All Active ({activeUsers.length})
                </button>

                <button
                  type="button"
                  onClick={() => setRoleFilter("student")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1px solid #cbd5e1",
                    background: roleFilter === "student" ? "#2563eb" : "#ffffff",
                    color: roleFilter === "student" ? "#ffffff" : "#334155"
                  }}
                >
                  Students ({stats.activeStudentsCount || 0})
                </button>

                <button
                  type="button"
                  onClick={() => setRoleFilter("coordinator")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1px solid #cbd5e1",
                    background: roleFilter === "coordinator" ? "#16a34a" : "#ffffff",
                    color: roleFilter === "coordinator" ? "#ffffff" : "#334155"
                  }}
                >
                  Coordinators ({stats.activeCoordinatorsCount || 0})
                </button>
              </div>
            </div>

            {/* SEARCH INPUT */}
            <div style={{ marginBottom: "15px" }}>
              <input
                type="text"
                placeholder="Search active users by Name, Email, AG Number, Employee ID, or IP Address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px"
                }}
              />
            </div>

            {/* TABLE */}
            <div className="admin-table-responsive">
              <table className="admin-data-table" style={{ fontSize: "13px" }}>
                <thead>
                  <tr>
                    <th>User & Role</th>
                    <th>ID / AG / Emp ID</th>
                    <th>IP Address</th>
                    <th>Campus & Department</th>
                    <th>Last Activity</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActiveUsers.length > 0 ? (
                    filteredActiveUsers.map((u) => {
                      const roleLower = (u.role || "").toLowerCase();
                      const roleBadgeColor =
                        roleLower === "superadmin"
                          ? "#9333ea"
                          : roleLower === "coordinator"
                          ? "#16a34a"
                          : "#2563eb";

                      return (
                        <tr key={u.id}>
                          <td>
                            <strong>{u.name}</strong>
                            <br />
                            <small style={{ color: "#64748b" }}>{u.email}</small>
                            <br />
                            <span
                              style={{
                                display: "inline-block",
                                marginTop: "4px",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                backgroundColor: `${roleBadgeColor}15`,
                                color: roleBadgeColor,
                                border: `1px solid ${roleBadgeColor}40`
                              }}
                            >
                              {u.role ? u.role.toUpperCase() : "USER"}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {u.agNumber || u.employeeId || (roleLower === "superadmin" ? "SUPER ADMIN" : "N/A")}
                            </strong>
                          </td>

                          <td>
                            <code
                              style={{
                                background: "#0f172a",
                                color: "#38bdf8",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontFamily: "monospace",
                                fontSize: "12px",
                                fontWeight: "bold"
                              }}
                            >
                              {u.ip || "127.0.0.1"}
                            </code>
                          </td>

                          <td>
                            <div>
                              <strong>{u.campus || "Main Campus"}</strong>
                              <br />
                              <small style={{ color: "#64748b" }}>{u.department || "N/A"}</small>
                            </div>
                          </td>

                          <td>
                            {u.lastActiveAt
                              ? new Date(u.lastActiveAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
                                " (" + new Date(u.lastActiveAt).toLocaleDateString() + ")"
                              : "Just now"}
                          </td>

                          <td style={{ textAlign: "center" }}>
                            {u.isOnline ? (
                              <span style={{ color: "#166534", fontWeight: "bold", background: "#dcfce7", padding: "4px 10px", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }}></span> ONLINE
                              </span>
                            ) : (
                              <span style={{ color: "#475569", background: "#f1f5f9", padding: "4px 10px", borderRadius: "12px" }}>
                                RECENT SESSION
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                        No active users matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
