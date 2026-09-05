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
  const getSemesterOptions = () => {
    const commencing = formData.semesterCommencing;
    if (commencing === "Fall") {
      return [{ number: 1, name: "Semester 1" }];
    }
    if (commencing === "Winter") {
      return [
        { number: 3, name: "Semester 3" },
        { number: 5, name: "Semester 5" },
        { number: 7, name: "Semester 7" },
        { number: 9, name: "Semester 9" },
        { number: 11, name: "Semester 11" },
      ];
    }
    if (commencing === "Spring") {
      return [
        { number: 2, name: "Semester 2" },
        { number: 4, name: "Semester 4" },
        { number: 6, name: "Semester 6" },
        { number: 8, name: "Semester 8" },
        { number: 10, name: "Semester 10" },
        { number: 12, name: "Semester 12" },
      ];
    }
    if (commencing === "Summer") {
      return [
        { number: "Summer semester 1", name: "Summer semester 1" },
        { number: "Summer semester 2", name: "Summer semester 2" },
        { number: "Summer semester 3", name: "Summer semester 3" },
        { number: "Summer semester 4", name: "Summer semester 4" },
        { number: "Summer semester 5", name: "Summer semester 5" },
        { number: "Summer semester 6", name: "Summer semester 6" },
      ];
    }
    // Default list (if not selected yet)
    return [
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

      // Latest Draft jisme voucher uploaded hai
      const draftWithVoucher = myForms.find(
        (f) => f.status === "Draft" && f.voucher?.uploaded === true
      );

      if (!draftWithVoucher) {
        setErrorMsg(
          "Please upload your fee voucher before submitting the form."
        );
        return;
      }

      await api.put(`/ugforms/${draftWithVoucher._id}`, {
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

          {/* Semester Commencing Dropdown (Dynamic based on Month) */}
          <div className="ug-form-group">
            <label>
              Semester Commencing <span style={{ color: "red" }}> *</span>
            </label>
            <select
              name="semesterCommencing"
              value={formData.semesterCommencing}
              onChange={handleChange}
              required
            >
              <option value="">Select Semester Commencing</option>
              {commencingOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}

              {/* Fallback to show all options if user wants to select another term */}
              {!commencingOptions.includes("Spring") && (
                <option value="Spring">Spring</option>
              )}
              {!commencingOptions.includes("Summer") && (
                <option value="Summer">Summer</option>
              )}
              {!commencingOptions.includes("Fall") && (
                <option value="Fall">Fall</option>
              )}
              {!commencingOptions.includes("Winter") && (
                <option value="Winter">Winter</option>
              )}
            </select>
          </div>

          {/* Semester Number Dropdown (Dynamic based on Semester Commencing) */}
          <div className="ug-form-group">
            <label>
              Semester <span style={{ color: "red" }}> *</span>
            </label>
            <select
              name="semesterNumber"
              value={formData.semesterNumber}
              onChange={handleChange}
              required
            >
              <option value="">
                {formData.semesterCommencing
                  ? "Select Semester"
                  : "Select Semester Commencing First"}
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
              className="ug-action-btn"
              onClick={handleUploadVoucher}
            >
              Upload Voucher
              <span className="ug-upload-symbol">↑</span>
            </button>

            <button
              type="button"
              className="ug-action-btn ug-cancel-btn"
              onClick={() => navigate("/student/dashboard")}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default UGForm;