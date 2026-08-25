import React, { useEffect, useState } from "react";
import api from "../../../api/api";
import { FiFileText, FiCheckCircle, FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./CoordinatorDashboard.css";

const CoordinatorDashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    requests: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        setLoading(true);

        // Pehle coordinator-dashboard API try karo
        try {
          const response = await api.get("/ugforms/coordinator-dashboard");
          setDashboardData(response.data);
        } catch (err) {
          // Agar wo fail ho jaye to normal /ugforms se data lao
          const res = await api.get("/ugforms");
          const allForms = res.data.filter((f) => f.status !== "Draft");

          const totalRequests = allForms.length;
          const pendingRequests = allForms.filter(
            (f) => f.status === "Submitted"
          ).length;
          const approvedRequests = allForms.filter(
            (f) => f.status === "Approved"
          ).length;

          setDashboardData({
            totalRequests,
            pendingRequests,
            approvedRequests,
            requests: allForms.slice(0, 10), // latest 10
          });
        }
      } catch (error) {
        console.log("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

 const handleView = (formId) => {
  navigate(`/coordinator/request/${formId}`);
};

  if (loading) {
    return <h2 style={{ textAlign: "center", padding: "40px" }}>Loading...</h2>;
  }

  return (
    <div className="coordinator-dashboard-page">
      {/* =========================
          OVERVIEW SECTION
      ========================== */}
      <section className="coordinator-overview-card">
        <h2 className="coordinator-section-title">Dashboard Overview</h2>

        <div className="coordinator-stats-grid">
          {/* TOTAL REQUESTS */}
          <div className="coordinator-stat-card">
            <div className="coordinator-stat-icon">
              <FiFileText />
            </div>
            <div>
              <p>Total Requests</p>
              <h3>{dashboardData.totalRequests}</h3>
            </div>
          </div>

          {/* PENDING REQUESTS */}
          <div className="coordinator-stat-card">
            <div className="coordinator-stat-icon">
              <FiClock />
            </div>
            <div>
              <p>Pending Requests</p>
              <h3>{dashboardData.pendingRequests}</h3>
            </div>
          </div>

          {/* APPROVED REQUESTS */}
          <div className="coordinator-stat-card">
            <div className="coordinator-stat-icon">
              <FiCheckCircle />
            </div>
            <div>
              <p>Approved Requests</p>
              <h3>{dashboardData.approvedRequests}</h3>
            </div>
          </div>
        </div>

        {/* QUICK ACTION BUTTONS */}
        <div className="coordinator-quick-actions">
          <button
            type="button"
            onClick={() => navigate("/coordinator/student-form")}
          >
            Manage Student Form
          </button>

          <button
            type="button"
            className="secondary-action"
            onClick={() => navigate("/coordinator/profile")}
          >
            Edit Profile
          </button>
        </div>

        <p className="coordinator-dashboard-tip">
          Review student UG form requests and update their status.
        </p>
      </section>

      {/* =========================
          ACADEMIC STRUCTURE
      ========================== */}
      <section className="coordinator-overview-card">
        <h2 className="coordinator-section-title">Academic Structure</h2>

        <div className="coordinator-quick-actions academic-actions">
          <button
            type="button"
            className="secondary-action"
            onClick={() => navigate("/coordinator/add-degree")}
          >
            Add Degree
          </button>
        </div>

        <p className="coordinator-dashboard-tip">
          Add new departments and degrees for the academic structure.
        </p>
      </section>

      {/* =========================
          RECENT REQUESTS
      ========================== */}
      <section className="coordinator-recent-card">
        <h2 className="coordinator-section-title">Recent Requests</h2>

        <div className="coordinator-table-wrapper">
          <table className="coordinator-request-table">
            <thead>
              <tr>
                <th>FORM ID</th>
                <th>STUDENT</th>
                <th>SEMESTER</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {dashboardData.requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-request">
                    No Requests Available
                  </td>
                </tr>
              ) : (
                dashboardData.requests.map((item) => (
                  <tr key={item._id}>
                    <td>{item._id.slice(-6).toUpperCase()}</td>
                    <td>
                      {item.studentName || item.student_id?.name || "-"}
                    </td>
                    <td>
                      {item.semester_id?.name ||
                        (item.semester_id?.number
                          ? `Semester ${item.semester_id.number}`
                          : "N/A")}
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <span
                        className={`status-badge ${item.status?.toLowerCase()}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-request-btn"
                        onClick={() => handleView(item._id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default CoordinatorDashboard;