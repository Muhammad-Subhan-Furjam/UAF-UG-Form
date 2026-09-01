import { Routes, Route } from "react-router-dom";

import Home from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import Signup from "./Pages/Signup/Signup";

/* STUDENT */
import StudentLayout from "./Layout/StudentLayout/StudentLayout";
import Dashboard from "./Pages/Student/Dashboard/Dashboard";
import MyRequests from "./Pages/Student/MyRequests/MyRequests";
import MyForms from "./Pages/Student/MyForms/MyForms";
import MyCourses from "./Pages/Student/MyCourses/MyCourses";
import Profile from "./Pages/Student/Profile/Profile";
import Notification from "./Pages/Student/Notifications/Notification";
import FormPreview from "./Pages/Student/FormPreview/FormPreview";

/* COORDINATOR */
import CoordinatorLayout from "./Layout/CoordinatorLayout/CoordinatorLayout";
import CoordinatorDashboard from "./Pages/Coordinator/Dashboard/CoordinatorDashboard";
import CoordinatorRequests from "./Pages/Coordinator/MyRequests/CoordinatorRequests";
import CoordinatorCourses from "./Pages/Coordinator/Courses/CoordinatorCourses";
import CoordinatorAlerts from "./Pages/Coordinator/Notifications/CoordinatorAlerts";
import UGForm from "./Pages/Student/UGForm/UGForm";
import VoucherUpload from "./Pages/Student/VoucherUpload/VoucherUpload";
import CoordinatorForm from "./Pages/Coordinator/StudentFormPage/CoordinatorForm";

import CoordinatorProfile from "./Pages/Coordinator/CoordinatorProfilePage/CoordinatorProfile";
import PrintForm from "./Pages/Student/PrintForm/PrintForm";
import AddDegree from "./Pages/Coordinator/AddDegree/AddDegree";
import CoordinatorRequestDetail from "./Pages/Coordinator/CoordinatorRequestDetail/CoordinatorRequestDetail";

/* SUPER ADMIN */
import AdminLogin from "./Pages/Admin/AdminLogin";
import AdminLayout from "./Layout/AdminLayout/AdminLayout";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import StudentsList from "./Pages/Admin/StudentsList";
import CoordinatorsList from "./Pages/Admin/CoordinatorsList";
import AdminHierarchy from "./Pages/Admin/AdminHierarchy";
import AdminCourses from "./Pages/Admin/AdminCourses";

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* SECRET SUPER ADMIN LOGIN ROUTE */}
      <Route path="/ladmin" element={<AdminLogin />} />

      {/* =========================
          SUPER ADMIN ROUTES
      ========================= */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<StudentsList />} />
        <Route path="coordinators" element={<CoordinatorsList />} />
        <Route path="hierarchy" element={<AdminHierarchy />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="forms" element={<CoordinatorRequests />} />
      </Route>

      {/* =========================
          STUDENT ROUTES
      ========================= */}
      <Route path="/student" element={<StudentLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="requests" element={<MyRequests />} />
        <Route path="forms" element={<MyForms />} />
        <Route path="courses" element={<MyCourses />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notification />} />
        <Route path="ug-form" element={<UGForm />} />
        <Route path="upload-voucher" element={<VoucherUpload />} />
        <Route path="print-form" element={<PrintForm />} />
        <Route path="/student/form-preview/:id" element={<FormPreview />} />
      </Route>

      {/* =========================
          COORDINATOR ROUTES
      ========================= */}
      <Route path="/coordinator" element={<CoordinatorLayout />}>
        <Route path="dashboard" element={<CoordinatorDashboard />} />
        <Route path="requests" element={<CoordinatorRequests />} />
        <Route path="courses" element={<CoordinatorCourses />} />
        <Route path="notifications" element={<CoordinatorAlerts />} />
        <Route path="student-form" element={<CoordinatorForm />} />
        <Route path="profile" element={<CoordinatorProfile />} />
        <Route path="/coordinator/add-degree" element={<AddDegree />} />
        <Route path="/coordinator/request/:id" element={<CoordinatorRequestDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
