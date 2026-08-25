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

  const semesterOptions = [
    { number: 1, name: "1st" },
    { number: 2, name: "2nd" },
    { number: 3, name: "3rd" },
    { number: 4, name: "4th" },
    { number: 5, name: "5th" },
    { number: 6, name: "6th" },
    { number: 7, name: "7th" },
    { number: 8, name: "8th" },
  ];

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
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
    setSuccessMsg("");
  };

  // ==========================
  // SUBMIT
  // ==========================
const handleSubmitUGForm = async () => {
  setErrorMsg("");
  setSuccessMsg("");

  try {
    if (!formData.semesterNumber) {
      setErrorMsg("Please select a semester before submitting the form.");
      return;
    }

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

  if (!formData.semesterNumber) {
    setErrorMsg("Please select a semester before uploading the voucher.");
    return;
  }

  try {
    // Har baar NAYI draft form
    const createRes = await api.post("/ugforms", {
      semesterNumber: formData.semesterNumber,
      courses: selectedCourses,
      fatherName: formData.fatherName,
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

  return (
    <div className="ug-form-page">
      <div className="ug-form-top">
        <div>
          <h2>Hello,</h2>
        </div>
        <div className="ug-university-title">
          <h3>University of Agriculture Faisalabad</h3>
          <h4>Faculty of Sciences</h4>
        </div>
      </div>

      <section className="ug-form-card">
        <form className="ug-main-form" onSubmit={(e) => e.preventDefault()}>
          <div className="ug-form-group">
            <label>Student Name</label>
            <input type="text" value={formData.studentName} readOnly />
          </div>

          <div className="ug-form-group">
            <label>Father Name</label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
            />
          </div>

          <div className="ug-form-group">
            <label>Phone Number</label>
            <input type="text" value={formData.phoneNumber} readOnly />
          </div>

          <div className="ug-form-group">
            <label>AG Number</label>
            <input type="text" value={formData.agNumber} readOnly />
          </div>

          <div className="ug-form-group">
            <label>Degree</label>
            <input type="text" value={formData.degree} readOnly />
          </div>

          <div className="ug-form-group">
            <label>Semester</label>
            <select
              name="semesterNumber"
              value={formData.semesterNumber}
              onChange={handleChange}
              required
            >
              <option value="">Select Semester</option>
              {semesterOptions.map((sem) => (
                <option key={sem.number} value={sem.number}>
                  {sem.name}
                </option>
              ))}
            </select>
          </div>

          <div className="ug-form-group">
            <label>Semester Commencing</label>
            <select
              name="semesterCommencing"
              value={formData.semesterCommencing}
              onChange={handleChange}
            >
              <option value="">Select Semester</option>
              <option value="Winter">Winter</option>
              <option value="Summer">Summer</option>
              <option value="Spring">Spring</option>
              <option value="Fall">Fall</option>
            </select>
          </div>

          <div className="ug-form-group">
            <label>Date of First Enrollment (as per fee voucher)</label>
            <input
              type="date"
              name="firstEnrollmentDate"
              value={formData.firstEnrollmentDate}
              onChange={handleChange}
            />
          </div>

          <div className="ug-form-group">
            <label>Section</label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleChange}
            />
          </div>

          <div className="ug-form-group">
            <label>Voucher Number</label>
            <input
              type="text"
              name="voucherNumber"
              value={formData.voucherNumber}
              onChange={handleChange}
            />
          </div>

          <div className="ug-form-group ug-address-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
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
          </div>
        </form>
      </section>
    </div>
  );
};

export default UGForm;