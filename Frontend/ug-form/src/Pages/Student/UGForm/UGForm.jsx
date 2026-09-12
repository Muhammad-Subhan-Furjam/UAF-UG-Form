import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UGForm.css";
import api from "../../../../src/api/api";

const UGForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    student_id: "",
    campus_id: "",
    faculty_id: "",
    department_id: "",
    degree_id: "",
    semesterNumber: "",
    agNumber: "",
    degree: "",
    semesterCommencing: "",
    firstEnrollmentDate: "",
    section: "",
    studentName: "",
    fatherName: "",
    phoneNumber: "",
    voucherNumber: "",
    address: "",
  });

  const [student, setStudent] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [hasUploadedVoucher, setHasUploadedVoucher] = useState(false);
  const [hasUploadedDeferment, setHasUploadedDeferment] = useState(false);
  const [myDocVoucherUrl, setMyDocVoucherUrl] = useState("");
  const [myDocDefermentUrl, setMyDocDefermentUrl] = useState("");
  const [previewModalDoc, setPreviewModalDoc] = useState(null);

  // Determine available Semester Commencing options based on Current Month
  const currentMonth = new Date().getMonth(); // 0 = Jan, 1 = Feb, 5 = Jun, 8 = Sep
  let commencingOptions = ["Fall", "Winter"];
  if (currentMonth === 1) {
    // February
    commencingOptions = ["Spring"];
  } else if (currentMonth === 5) {
    // June
    commencingOptions = ["Summer"];
  } else {
    // September / Fall admission period
    commencingOptions = ["Fall", "Winter"];
  }

  // Dynamic Semester Options based on selected Semester Commencing
  const getBatchLimits = () => {
    let session = student?.session || "";

    if (!session && student?.ag_number) {
      const match = student.ag_number.match(/^(\d{4})/);
      if (match) {
        const year = parseInt(match[1]);
        session = `${year}-${year + 4}`;
      }
    }

    if (session === "2023-2027") {
      return { maxRegularSemester: 6, maxSummerSemester: 3 };
    }
    if (session === "2024-2028") {
      return { maxRegularSemester: 4, maxSummerSemester: 2 };
    }
    if (session === "2025-2029") {
      return { maxRegularSemester: 2, maxSummerSemester: 1 };
    }
    if (session === "2026-2030") {
      return { maxRegularSemester: 2, maxSummerSemester: 1 };
    }
    return { maxRegularSemester: 2, maxSummerSemester: 1 };
  };

  // Dynamic Semester Options filtered strictly by student's Batch / Session reach
  const getSemesterOptions = () => {
    const commencing = formData.semesterCommencing;
    const { maxRegularSemester, maxSummerSemester } = getBatchLimits();

    let allOptions = [];

    if (commencing === "Fall") {
      allOptions = [{ number: 1, name: "Semester 1" }];
    } else if (commencing === "Winter") {
      allOptions = [
        { number: 3, name: "Semester 3" },
        { number: 5, name: "Semester 5" },
        { number: 7, name: "Semester 7" },
        { number: 9, name: "Semester 9" },
        { number: 11, name: "Semester 11" },
      ];
    } else if (commencing === "Spring") {
      allOptions = [
        { number: 2, name: "Semester 2" },
        { number: 4, name: "Semester 4" },
        { number: 6, name: "Semester 6" },
        { number: 8, name: "Semester 8" },
        { number: 10, name: "Semester 10" },
        { number: 12, name: "Semester 12" },
      ];
    } else if (commencing === "Summer") {
      allOptions = [
        { number: "Summer semester 1", name: "Summer semester 1", summerNum: 1 },
        { number: "Summer semester 2", name: "Summer semester 2", summerNum: 2 },
        { number: "Summer semester 3", name: "Summer semester 3", summerNum: 3 },
        { number: "Summer semester 4", name: "Summer semester 4", summerNum: 4 },
        { number: "Summer semester 5", name: "Summer semester 5", summerNum: 5 },
        { number: "Summer semester 6", name: "Summer semester 6", summerNum: 6 },
      ];
    } else {
      allOptions = [
        { number: 1, name: "Semester 1 (Fall)" },
        { number: 2, name: "Semester 2 (Spring)" },
        { number: 3, name: "Semester 3 (Winter)" },
        { number: 4, name: "Semester 4 (Spring)" },
        { number: 5, name: "Semester 5 (Winter)" },
        { number: 6, name: "Semester 6 (Spring)" },
        { number: 7, name: "Semester 7 (Winter)" },
        { number: 8, name: "Semester 8 (Spring)" },
        { number: 9, name: "Semester 9 (Winter)" },
        { number: 10, name: "Semester 10 (Spring)" },
        { number: 11, name: "Semester 11 (Winter)" },
        { number: 12, name: "Semester 12 (Spring)" },
      ];
    }

    // Filter out future upcoming semesters beyond student batch reach
    return allOptions.filter((opt) => {
      if (typeof opt.number === "number") {
        return opt.number <= maxRegularSemester;
      }
      if (opt.summerNum) {
        return opt.summerNum <= maxSummerSemester;
      }
      return true;
    });
  };

  useEffect(() => {
    const loadStudentProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        const user = response.data.user;
        setStudent(user);

        let degreeName = "";
        if (user.degree_id) {
          if (typeof user.degree_id === "object" && user.degree_id.name) {
            degreeName = user.degree_id.name;
          } else {
            try {
              const degreeId =
                typeof user.degree_id === "object"
                  ? user.degree_id._id
                  : user.degree_id;
              const degRes = await api.get("/degrees");
              const found = degRes.data.find(
                (d) => String(d._id) === String(degreeId)
              );
              if (found) degreeName = found.name;
            } catch (err) {
              console.log(err);
            }
          }
        }

        setFormData((prev) => ({
          ...prev,
          student_id: user._id,
          campus_id: user.campus_id?._id || user.campus_id || "",
          faculty_id: user.faculty_id?._id || user.faculty_id || "",
          department_id: user.department_id?._id || user.department_id || "",
          degree_id:
            user.degree_id && typeof user.degree_id === "object"
              ? user.degree_id._id
              : user.degree_id || "",
          agNumber: user.ag_number || "",
          studentName: user.name || "",
          phoneNumber: user.phone || "",
          degree: degreeName,
          fatherName: user.fatherName || "",
          firstEnrollmentDate: user.admissionDate
            ? new Date(user.admissionDate).toISOString().split("T")[0]
            : "",
        }));

        // Fetch student's existing forms to check voucher / deferment upload status and URLs for preview
        try {
          const formsRes = await api.get("/ugforms");
          const myForms = formsRes.data || [];
          const formWithVoucher = myForms.find((f) => f.voucher?.uploaded === true && (f.voucher?.fileUrl || f.voucher?.base64Data));
          const formWithDeferment = myForms.find((f) => f.deferment?.uploaded === true && (f.deferment?.fileUrl || f.deferment?.base64Data));

          setHasUploadedVoucher(!!formWithVoucher);
          setHasUploadedDeferment(!!formWithDeferment);

          if (formWithVoucher) {
            setMyDocVoucherUrl(formWithVoucher.voucher.fileUrl || formWithVoucher.voucher.base64Data);
          }
          if (formWithDeferment) {
            setMyDocDefermentUrl(formWithDeferment.deferment.fileUrl || formWithDeferment.deferment.base64Data);
          }
        } catch (err) {
          console.log("UGForms fetch error:", err);
        }
      } catch (error) {
        console.log("Profile Error:", error.response?.data || error);
      }
    };

    loadStudentProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "semesterCommencing") {
      setFormData((prev) => ({
        ...prev,
        semesterCommencing: value,
        semesterNumber: "", // Reset semester number when commencing changes
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrorMsg("");
    setSuccessMsg("");
  };

  const validateMandatoryFields = () => {
    if (
      !formData.studentName?.trim() ||
      !formData.fatherName?.trim() ||
      !formData.phoneNumber?.trim() ||
      !formData.agNumber?.trim() ||
      !formData.degree?.trim() ||
      !formData.semesterCommencing?.trim() ||
      !formData.semesterNumber ||
      !formData.firstEnrollmentDate ||
      !formData.section?.trim() ||
      !formData.voucherNumber?.trim() ||
      !formData.address?.trim()
    ) {
      return "All fields marked with * are mandatory. Please complete all fields before proceeding.";
    }
    return null;
  };

  // ==========================
  // SUBMIT
  // ==========================
  const handleSubmitUGForm = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    const validationError = validateMandatoryFields();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    try {
      const formsRes = await api.get("/ugforms");
      const myForms = formsRes.data || [];

      // Latest Draft jisme voucher ya deferment uploaded hai
      const draftWithDoc = myForms.find(
        (f) =>
          f.status === "Draft" &&
          (f.voucher?.uploaded === true || f.deferment?.uploaded === true)
      );

      if (!draftWithDoc) {
        setErrorMsg(
          'Please upload either your "Paid Fee Voucher" or "Approved Fee Deferment Application Form" before submitting the form.'
        );
        return;
      }

      await api.put(`/ugforms/${draftWithDoc._id}`, {
        status: "Submitted",
        fatherName: formData.fatherName,
        degree: formData.degree,
        semesterCommencing: formData.semesterCommencing,
        firstEnrollmentDate: formData.firstEnrollmentDate,
        section: formData.section,
        voucherNumber: formData.voucherNumber,
        address: formData.address,
      });

      setSuccessMsg("UG Form submitted successfully.");
      setTimeout(() => navigate("/student/requests"), 1000);
    } catch (error) {
      console.log(error.response?.data || error);
      setErrorMsg(
        error.response?.data?.message || "Submission failed. Please try again."
      );
    }
  };

  const handleSearchUGForm = () => {
    setErrorMsg("");
    const validationError = validateMandatoryFields();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    navigate("/student/forms", {
      state: {
        previewData: formData,
        isPreview: true,
      },
    });
  };

  // ==========================
  // UPLOAD VOUCHER
  // ==========================
  const handleUploadVoucher = async () => {
    if (hasUploadedDeferment) {
      setErrorMsg("Fee Deferment Application has already been uploaded. Voucher upload is disabled.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");

    const validationError = validateMandatoryFields();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    try {
      const createRes = await api.post("/ugforms", {
        semesterNumber: formData.semesterNumber,
        courses: selectedCourses,
        fatherName: formData.fatherName,
        degree: formData.degree,
        semesterCommencing: formData.semesterCommencing,
        firstEnrollmentDate: formData.firstEnrollmentDate,
        section: formData.section,
        voucherNumber: formData.voucherNumber,
        address: formData.address,
        voucher: { uploaded: false },
        status: "Draft",
      });

      const formId = createRes.data.form._id;

      navigate("/student/upload-voucher", {
        state: {
          ugFormData: formData,
          formId: formId,
          uploadType: "voucher",
        },
      });
    } catch (error) {
      console.log(error);
      setErrorMsg(
        error.response?.data?.message ||
          "Could not prepare form for voucher upload."
      );
    }
  };

  // ==========================
  // UPLOAD DEFERMENT
  // ==========================
  const handleUploadDeferment = async () => {
    if (hasUploadedVoucher) {
      setErrorMsg("Fee Voucher has already been uploaded. Deferment upload is disabled.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");

    const validationError = validateMandatoryFields();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    try {
      const createRes = await api.post("/ugforms", {
        semesterNumber: formData.semesterNumber,
        courses: selectedCourses,
        fatherName: formData.fatherName,
        degree: formData.degree,
        semesterCommencing: formData.semesterCommencing,
        firstEnrollmentDate: formData.firstEnrollmentDate,
        section: formData.section,
        voucherNumber: formData.voucherNumber,
        address: formData.address,
        deferment: { uploaded: false },
        status: "Draft",
      });

      const formId = createRes.data.form._id;

      navigate("/student/upload-deferment", {
        state: {
          ugFormData: formData,
          formId: formId,
          uploadType: "deferment",
        },
      });
    } catch (error) {
      console.log(error);
      setErrorMsg(
        error.response?.data?.message ||
          "Could not prepare form for fee deferment upload."
      );
    }
  };

  const loggedInAgNumber =
    student?.ag_number || student?.employee_id || student?.name || "Student";
  const facultyTitle =
    student?.faculty_id?.name ||
    student?.department_id?.name ||
    "Faculty of Sciences";

  return (
    <div className="ug-form-page">
      <div className="ug-form-top">
        <div>
          <h2>Hello, {loggedInAgNumber}</h2>
        </div>
        <div className="ug-university-title">
          <h3>University of Agriculture Faisalabad</h3>
          <h4>{facultyTitle}</h4>
        </div>
      </div>

      <section className="ug-form-card">
        <form className="ug-main-form" onSubmit={(e) => e.preventDefault()}>
          <div className="ug-form-group">
            <label>
              Student Name <span style={{ color: "red" }}> *</span>
            </label>
            <input type="text" value={formData.studentName} readOnly />
          </div>

          <div className="ug-form-group">
            <label>
              Father Name <span style={{ color: "red" }}> *</span>
            </label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              placeholder="Enter Father Name"
              required
            />
          </div>

          <div className="ug-form-group">
            <label>
              Phone Number <span style={{ color: "red" }}> *</span>
            </label>
            <input type="text" value={formData.phoneNumber} readOnly />
          </div>

          <div className="ug-form-group">
            <label>
              AG Number <span style={{ color: "red" }}> *</span>
            </label>
            <input type="text" value={formData.agNumber} readOnly />
          </div>

          {/* Manual Degree Input */}
          <div className="ug-form-group">
            <label>
              Degree <span style={{ color: "red" }}> *</span>
            </label>
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              placeholder="Enter Degree Name (e.g. B.Sc. (Hons.) Agriculture)"
              required
            />
          </div>

          {/* Semester Dropdown (Fall, Summer, Winter, Spring) */}
          <div className="ug-form-group">
            <label>
              Semester <span style={{ color: "red" }}> *</span>
            </label>
            <select
              name="semesterCommencing"
              value={formData.semesterCommencing}
              onChange={handleChange}
              required
            >
              <option value="">Select Semester</option>
              <option value="Fall">Fall</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
              <option value="Spring">Spring</option>
            </select>
          </div>

          {/* Semester Commencing Dropdown (Respective Semester Numbers) */}
          <div className="ug-form-group">
            <label>
              Semester Commencing <span style={{ color: "red" }}> *</span>
            </label>
            <select
              name="semesterNumber"
              value={formData.semesterNumber}
              onChange={handleChange}
              disabled={!formData.semesterCommencing}
              required
            >
              <option value="">
                {formData.semesterCommencing
                  ? "Select Semester Commencing"
                  : "Select Semester First"}
              </option>
              {getSemesterOptions().map((sem) => (
                <option key={sem.number} value={sem.number}>
                  {sem.name}
                </option>
              ))}
            </select>
          </div>

          <div className="ug-form-group">
            <label>
              Date of First Enrollment (as per fee voucher){" "}
              <span style={{ color: "red" }}> *</span>
            </label>
            <input
              type="date"
              name="firstEnrollmentDate"
              value={formData.firstEnrollmentDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ug-form-group">
            <label>
              Section <span style={{ color: "red" }}> *</span>
            </label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleChange}
              placeholder="e.g. Section A"
              required
            />
          </div>

          <div className="ug-form-group">
            <label>
              Voucher Number <span style={{ color: "red" }}> *</span>
            </label>
            <input
              type="text"
              name="voucherNumber"
              value={formData.voucherNumber}
              onChange={handleChange}
              placeholder="Enter Fee Voucher Number"
              required
            />
          </div>

          <div className="ug-form-group ug-address-group">
            <label>
              Address <span style={{ color: "red" }}> *</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter Complete Address"
              required
            />
          </div>

          {errorMsg && (
            <p
              style={{
                color: "#dc2626",
                fontWeight: 500,
                textAlign: "center",
                marginBottom: "12px",
                width: "100%",
              }}
            >
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p
              style={{
                color: "#16a34a",
                fontWeight: 500,
                textAlign: "center",
                marginBottom: "12px",
                width: "100%",
              }}
            >
              {successMsg}
            </p>
          )}

          <div className="ug-form-actions">
            <button
              type="button"
              className="ug-action-btn"
              onClick={handleSearchUGForm}
            >
              Preview UG Form
            </button>

            <button
              type="button"
              className="ug-action-btn"
              onClick={handleSubmitUGForm}
            >
              Submit UG-Form
            </button>

            <button
              type="button"
              className={`ug-action-btn ${hasUploadedDeferment ? "disabled-upload-btn" : ""}`}
              onClick={handleUploadVoucher}
              disabled={hasUploadedDeferment}
              title={hasUploadedDeferment ? "Disabled: Fee Deferment has already been uploaded" : ""}
            >
              Upload Voucher
            </button>

            <button
              type="button"
              className={`ug-action-btn ${hasUploadedVoucher ? "disabled-upload-btn" : ""}`}
              onClick={handleUploadDeferment}
              disabled={hasUploadedVoucher}
              title={hasUploadedVoucher ? "Disabled: Fee Voucher has already been uploaded" : ""}
            >
              Upload Deferment
            </button>

            <button
              type="button"
              className="ug-action-btn ug-cancel-btn"
              onClick={() => navigate("/student/dashboard")}
            >
              Cancel
            </button>

            <p
              className="ug-upload-note"
              style={{
                color: "#082f5c",
                fontWeight: "600",
                fontSize: "13px",
                textAlign: "center",
                marginTop: "14px",
                gridColumn: "1 / -1",
                width: "100%",
                background: "#f1f5f9",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1"
              }}
            >
              Notice: Please upload either the "Paid Fee Voucher" or "Approved Fee Deferment Application Form" image (File size must be ≤ 75KB).
            </p>
          </div>

          {/* STUDENT UPLOADED DOCUMENTS PREVIEW CARD */}
          {(myDocVoucherUrl || myDocDefermentUrl) && (
            <div
              className="student-uploaded-docs-section"
              style={{
                marginTop: "25px",
                padding: "16px",
                background: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid #e2e8f0"
              }}
            >
              <h4 style={{ margin: "0 0 12px 0", color: "#082f5c", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📷</span> Your Uploaded Document Previews:
              </h4>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {myDocVoucherUrl && (
                  <div
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px",
                      background: "#ffffff",
                      textAlign: "center",
                      minWidth: "160px"
                    }}
                  >
                    <p style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "bold", color: "#166534" }}>
                      ✓ Paid Fee Voucher
                    </p>
                    {myDocVoucherUrl.startsWith("data:image") || myDocVoucherUrl.includes("/uploads/") ? (
                      <img
                        src={myDocVoucherUrl}
                        alt="Fee Voucher Thumbnail"
                        style={{
                          width: "140px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          cursor: "pointer",
                          border: "1px solid #e2e8f0"
                        }}
                        onClick={() => setPreviewModalDoc({ title: "Paid Fee Voucher", url: myDocVoucherUrl })}
                      />
                    ) : (
                      <p style={{ fontSize: "11px", color: "#64748b" }}>PDF / Document File Uploaded</p>
                    )}
                    <br />
                    <button
                      type="button"
                      style={{
                        marginTop: "6px",
                        fontSize: "12px",
                        padding: "4px 10px",
                        background: "#082f5c",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                      onClick={() => setPreviewModalDoc({ title: "Paid Fee Voucher", url: myDocVoucherUrl })}
                    >
                      Preview Full Image
                    </button>
                  </div>
                )}

                {myDocDefermentUrl && (
                  <div
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px",
                      background: "#ffffff",
                      textAlign: "center",
                      minWidth: "160px"
                    }}
                  >
                    <p style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "bold", color: "#166534" }}>
                      ✓ Approved Fee Deferment
                    </p>
                    {myDocDefermentUrl.startsWith("data:image") || myDocDefermentUrl.includes("/uploads/") ? (
                      <img
                        src={myDocDefermentUrl}
                        alt="Deferment Form Thumbnail"
                        style={{
                          width: "140px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          cursor: "pointer",
                          border: "1px solid #e2e8f0"
                        }}
                        onClick={() => setPreviewModalDoc({ title: "Approved Fee Deferment Form", url: myDocDefermentUrl })}
                      />
                    ) : (
                      <p style={{ fontSize: "11px", color: "#64748b" }}>PDF / Document File Uploaded</p>
                    )}
                    <br />
                    <button
                      type="button"
                      style={{
                        marginTop: "6px",
                        fontSize: "12px",
                        padding: "4px 10px",
                        background: "#082f5c",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                      onClick={() => setPreviewModalDoc({ title: "Approved Fee Deferment Form", url: myDocDefermentUrl })}
                    >
                      Preview Full Image
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </section>

      {/* STUDENT DOCUMENT LIGHTBOX PREVIEW MODAL */}
      {previewModalDoc && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px"
          }}
          onClick={() => setPreviewModalDoc(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              maxWidth: "800px",
              width: "95%",
              maxHeight: "90vh",
              overflow: "hidden",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "16px 20px",
                background: "#082f5c",
                color: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
                Uploaded Document Preview: {previewModalDoc.title}
              </h3>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "20px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
                onClick={() => setPreviewModalDoc(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "20px", overflowY: "auto", textAlign: "center", flex: 1, background: "#f8fafc" }}>
              {previewModalDoc.url.startsWith("data:image") || previewModalDoc.url.includes("/uploads/") ? (
                <img
                  src={previewModalDoc.url}
                  alt={previewModalDoc.title}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "65vh",
                    objectFit: "contain",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                />
              ) : (
                <iframe
                  src={previewModalDoc.url}
                  title={previewModalDoc.title}
                  style={{ width: "100%", height: "60vh", border: "none" }}
                />
              )}
            </div>

            <div style={{ padding: "12px 20px", background: "#f1f5f9", textAlign: "right", borderTop: "1px solid #e2e8f0" }}>
              <button
                style={{
                  padding: "8px 18px",
                  background: "#475569",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
                onClick={() => setPreviewModalDoc(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UGForm;