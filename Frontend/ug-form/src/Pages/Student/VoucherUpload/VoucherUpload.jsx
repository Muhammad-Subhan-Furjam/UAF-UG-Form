import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import "./VoucherUpload.css";

const VoucherUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
    ];

    if (!allowedTypes.includes(file.type)) {
      setSelectedFile(null);
      setMessage("Only PDF, PNG, JPG or JPEG files are allowed.");
      return;
    }

    if (file.size > 25 * 1024) {
      setSelectedFile(null);
      setMessage("File size must be less than 25KB.");
      return;
    }

    setSelectedFile(file);
    setAttachedFile(null);
    setMessage(`Selected: ${file.name}`);
  };

  const handleAttach = () => {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }
    setAttachedFile(selectedFile);
    setMessage(`${selectedFile.name} attached successfully.`);
  };

  const handleCancel = () => {
    navigate("/student/ug-form");
  };

  const handleSubmit = async () => {
    if (!attachedFile) {
      setMessage("Please attach your voucher before submitting.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Uploading...");

      // 1. formId from navigation state
      let formId = location.state?.formId;

      // 2. Agar nahi mila to backend se (already student-filtered)
      if (!formId) {
        const formsRes = await api.get("/ugforms");
        const myForms = formsRes.data || [];

        if (myForms.length === 0) {
          setMessage("No UG Form found. Please fill the form first.");
          setLoading(false);
          return;
        }

        formId = myForms[0]._id;
      }

      const formDataUpload = new FormData();
      formDataUpload.append("voucher", attachedFile);

      await api.put(`/ugforms/${formId}/voucher`, formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Voucher uploaded successfully. You can now submit your form.");
      setTimeout(() => {
        navigate("/student/ug-form");
      }, 1200);
    } catch (error) {
      console.log(error);
      setMessage(
        error.response?.data?.message || "Failed to upload voucher"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voucher-page">
      <div className="voucher-header">
        <h2>University of Agriculture Faisalabad</h2>
        <h3>Faculty of Sciences</h3>
      </div>

      <section className="voucher-upload-card">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="voucher-hidden-input"
          onChange={handleFileChange}
        />

        <p className="voucher-attach-text">
          Attach PDF, PNG or JPG (Max size: 25KB)
        </p>

        <button
          type="button"
          className="voucher-upload-btn"
          onClick={handleUploadClick}
        >
          Upload File
        </button>

        {selectedFile && (
          <div className="voucher-selected-file">
            <strong>Selected File:</strong>
            <span>{selectedFile.name}</span>
          </div>
        )}

        {attachedFile && (
          <div className="voucher-attached-status">✓ File Attached</div>
        )}

        {message && <p className="voucher-message">{message}</p>}
      </section>

      <div className="voucher-actions">
        <button
          type="button"
          className="voucher-action-btn"
          onClick={handleAttach}
          disabled={loading}
        >
          Attach
        </button>

        <button
          type="button"
          className="voucher-action-btn"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="button"
          className="voucher-action-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default VoucherUpload;