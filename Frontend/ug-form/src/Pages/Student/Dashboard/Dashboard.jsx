import React, { useState, useEffect } from "react";
import { FiFileText, FiUpload, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);

        // Backend already returns only this student's forms
        const res = await api.get("/ugforms");
        const myForms = (res.data || []).filter(
          (form) => form.status !== "Draft"
        );

        setRequests(myForms);
      } catch (error) {
        console.log("Error fetching requests:", error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getSemesterName = (form) => {
    if (form.semester_id?.name) return form.semester_id.name;
    if (form.semester_id?.number) return `Semester ${form.semester_id.number}`;
    return "-";
  };

  const handleView = (formId) => {
    navigate("/student/forms", {
      state: { viewFormId: formId },
    });
  };

  return (
    <div className="student-dashboard">
      {/* HOW IT WORKS */}
      <section className="dashboard-card how-it-works">
        <h2 className="dashboard-section-title">How it works</h2>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-icon">
              <FiFileText />
            </div>
            <div className="step-content">
              <h3>1. Fill your details</h3>
              <p>
                Courses are already entered by
                <br />
                your coordinator.
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-icon">
              <FiUpload />
            </div>
            <div className="step-content">
              <h3>2. Upload fee voucher</h3>
              <p>
                PDF, PNG or JPG after submitting
                <br />
                the form.
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-icon">
              <FiCheckCircle />
            </div>
            <div className="step-content">
              <h3>3. Print your form</h3>
              <p>Once the coordinator approves it.</p>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <button
            className="start-form-btn"
            onClick={() => navigate("/student/ug-form")}
          >
            Fill UG-Form
          </button>

          <button
            className="edit-profile-btn"
            onClick={() => navigate("/student/profile")}
          >
            Edit Profile
          </button>
        </div>

        <p className="dashboard-tip">
          Tip: add your degree and semester to your profile so your form loads
          automatically.
        </p>
      </section>

      {/* RECENT REQUESTS */}
      <section className="dashboard-card recent-requests">
        <h2 className="dashboard-section-title">Recent Requests</h2>

        <div className="requests-table-wrapper">
          {loading ? (
            <p style={{ textAlign: "center", padding: "30px" }}>Loading...</p>
          ) : (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>FORM ID</th>
                  <th>SEMESTER</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {requests.length === 0 ? (
                  <tr className="empty-request-row">
                    <td colSpan="5">
                      You have not submitted any UG form yet.
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request._id}>
                      <td>{request._id.slice(-8).toUpperCase()}</td>
                      <td>{getSemesterName(request)}</td>
                      <td>{formatDate(request.createdAt)}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            request.status === "Submitted"
                              ? "pending"
                              : request.status === "Approved"
                              ? "approved"
                              : "rejected"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => handleView(request._id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;