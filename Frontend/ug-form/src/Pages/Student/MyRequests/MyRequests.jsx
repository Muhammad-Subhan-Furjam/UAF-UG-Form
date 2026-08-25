import React, { useState, useEffect } from "react";
import api from "../../../api/api";
import "./MyRequests.css";
import { useNavigate } from "react-router-dom";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyRequests = async () => {
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

    fetchMyRequests();
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
    <div className="my-requests-page">
      <section className="requests-card">
        <h2 className="requests-title">Recent Requests</h2>

        <div className="requests-table-wrap">
          {loading ? (
            <p style={{ textAlign: "center", padding: "40px" }}>Loading...</p>
          ) : requests.length === 0 ? (
            <p style={{ textAlign: "center", padding: "40px", color: "#888" }}>
              No requests found. Submit a UG Form to see it here.
            </p>
          ) : (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Form Id</th>
                  <th>Semester</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>{request._id.slice(-8).toUpperCase()}</td>
                    <td>{getSemesterName(request)}</td>
                    <td>{formatDate(request.createdAt)}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          request.status === "Submitted" ||
                          request.status === "Pending"
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyRequests;