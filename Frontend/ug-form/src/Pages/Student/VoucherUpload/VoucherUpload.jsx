import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import "./VoucherUpload.css";

const VoucherUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const fileInputRef = useRef(null);

  const isDeferment =
    location.state?.uploadType === "deferment" ||
    location.pathname.includes("upload-deferment");

  const documentTitle = isDeferment
    ? "Upload Approved Fee Deferment Application Form"
    : "Upload Paid Fee Voucher";

  const fieldName = isDeferment ? "deferment" : "voucher";
  const apiEndpoint = isDeferment ? "/deferment" : "/voucher";

  const [selectedFile, setSelectedFile] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
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
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setMessage("Only PDF, PNG, JPG, JPEG, or WEBP files are allowed.");
      return;
    }

    if (file.size > 75 * 1024) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setMessage("File size exceeds 75KB limit! Please upload an image with a size less than or equal to 75KB.");
      return;
    }

    setSelectedFile(file);
    setAttachedFile(null);
    setMessage(`Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`);

    // Generate live preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
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
      setMessage(`Please attach your ${isDeferment ? "deferment application" : "voucher"} before submitting.`);
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
      formDataUpload.append(fieldName, attachedFile);

      await api.put(`/ugforms/${formId}${apiEndpoint}`, formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(`${isDeferment ? "Approved Fee Deferment Application Form" : "Paid Fee Voucher"} uploaded successfully. You can now submit your form.`);
      setTimeout(() => {
        navigate("/student/ug-form");
      }, 1200);
    } catch (error) {
      console.log(error);
      setMessage(
        error.response?.data?.message || `Failed to upload ${isDeferment ? "deferment application" : "voucher"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voucher-page">
      <div className="voucher-header">
        <h2>University of Agriculture Faisalabad</h2>
        <h3>{documentTitle}</h3>
      </div>

      <section className="voucher-upload-card">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="voucher-hidden-input"
          onChange={handleFileChange}
        />

        <p className="voucher-attach-text" style={{ fontWeight: 600, color: "#082f5c" }}>
          Upload image file (JPG, PNG, WEBP, PDF) with file size ≤ 75KB
        </p>

        <button
          type="button"
          className="voucher-upload-btn"
          onClick={handleUploadClick}
        >
          Select File (Max 75KB)
        </button>

        {selectedFile && (
          <div className="voucher-selected-file" style={{ marginTop: "12px", textAlign: "center" }}>
            <strong>Selected File:</strong> <span>{selectedFile.name}</span> ({Math.round(selectedFile.size / 1024)} KB)
          </div>
        )}

        {/* Live Document / Image Preview for Student */}
        {previewUrl && (
          <div className="voucher-preview-container" style={{ marginTop: "15px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", fontWeight: "bold", color: "#1e3a5f", marginBottom: "6px" }}>
              Uploaded Image Preview:
            </p>

            <img
              src={previewUrl}
              alt="Document Preview"
              style={{
                maxWidth: "280px",
                maxHeight: "220px",
                borderRadius: "8px",
                border: "2px solid #cbd5e1",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                objectFit: "contain",
                background: "#f8fafc"
              }}
            />
          </div>
        )}

        {attachedFile && (
          <div className="voucher-attached-status" style={{ marginTop: "10px", color: "#166534", fontWeight: "bold" }}>
            ✓ Document Attached & Ready for Upload
          </div>
        )}

        {message && (
          <p
            className="voucher-message"
            style={{
              marginTop: "12px",
              fontWeight: 600,
              color: message.includes("exceeds") || message.includes("Failed") || message.includes("Please") ? "#dc2626" : "#166534"
            }}
          >
            {message}
          </p>
        )}
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