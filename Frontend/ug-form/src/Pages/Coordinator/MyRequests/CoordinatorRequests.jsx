import React, { useState, useEffect } from "react";
import api from "../../../api/api";
import "./CoordinatorRequests.css";

const CoordinatorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================
  // Fetch UG Forms
  // ==========================
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await api.get("/ugforms");

        // Sirf Submitted, Approved, Rejected forms dikhayenge (Draft nahi)
        const filtered = res.data.filter(
          (form) => form.status !== "Draft"
        );

        setRequests(filtered);
      } catch (error) {
        console.log("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // ==========================
  // Helpers
  // ==========================
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
    if (form.semester_id?.number) return `${form.semester_id.number}th`;
    return "-";
  };

  const handleView = (formId) => {
    // Baad mein detail page bana sakte hain
    console.log("View Form:", formId);
    // navigate(`/coordinator/request/${formId}`);
  };

  const handleDownload = (formId) => {
    console.log("Download Form:", formId);
  };

  return (
    <div className="coordinator-requests-page">
      <section className="coordinator-requests-card">
        <h2 className="coordinator-requests-title">Recent Requests</h2>

        <div className="coordinator-requests-table-wrapper">
          {loading ? (
            <p style={{ textAlign: "center", padding: "40px" }}>Loading...</p>
          ) : requests.length === 0 ? (
            <p style={{ textAlign: "center", padding: "40px", color: "#888" }}>
              No requests found
            </p>
          ) : (
            <table className="coordinator-requests-table">
              <thead>
                <tr>
                  <th>Form Id</th>
                  <th>Student</th>
                  <th>Semester</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td className="request-form-id">
                      {request._id.slice(-8).toUpperCase()}
                    </td>

                    <td>{request.studentName || request.agNumber || "-"}</td>

                    <td>{getSemesterName(request)}</td>

                    <td>{formatDate(request.createdAt)}</td>

                    <td>
                      <span
                        className={`request-status ${
                          request.status === "Submitted" ||
                          request.status === "Pending"
                            ? "request-pending"
                            : request.status === "Approved"
                            ? "request-approved"
                            : "request-rejected"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td>
                      {request.status === "Submitted" ||
                      request.status === "Pending" ? (
                        <button
                          type="button"
                          className="request-action-btn request-view-btn"
                          onClick={() => handleView(request._id)}
                        >
                          View
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="request-action-btn request-download-btn"
                          onClick={() => handleDownload(request._id)}
                        >
                          Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default CoordinatorRequests;