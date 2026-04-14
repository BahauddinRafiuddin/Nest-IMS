import { Route, Routes, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleRoute from "../components/common/RoleRoute";

const ForceChangePassword = lazy(
  () => import("../pages/common/ForceChangePassword"),
);
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));

const Landing = lazy(() => import("../pages/public/Landing"));

const Interns = lazy(() => import("../pages/admin/Interns"));
const Mentors = lazy(() => import("../pages/admin/Mentors"));
const Programs = lazy(() => import("../pages/admin/Programs"));
const AdminFinance = lazy(() => import("../pages/admin/AdminFinance"));
const CompanyReviews = lazy(() => import("../pages/admin/CompanyReviews"));
const JoinRequest=lazy(()=> import("../pages/admin/JoinRequest"))

const Certificate = lazy(() => import("../pages/intern/Certificate"));
const InternPrograms = lazy(() => import("../pages/intern/InternProgram"));
const InternTasks = lazy(() => import("../pages/intern/InternTasks"));
const Performance = lazy(() => import("../pages/intern/Performance"));
const InternPayments = lazy(() => import("../pages/intern/InternPayments"));
const InternCreateReview = lazy(
  () => import("../pages/intern/InternCreateReview"),
);

const MentorPrograms = lazy(() => import("../pages/mentor/MentorPrograms"));
const MentorTasks = lazy(() => import("../pages/mentor/MentorTasks"));
const MentorInterns = lazy(() => import("../pages/mentor/MentorInterns"));
const InternPerformance = lazy(
  () => import("../pages/mentor/InternPerformance"),
);

const Companies = lazy(() => import("../pages/superadmin/Companies"));
const SuperAdminFinance = lazy(
  () => import("../pages/superadmin/SuperAdminFinance"),
);
const PendingReviews = lazy(() => import("../pages/superadmin/PendingReviews"));

const Profile = lazy(() => import("../pages/common/Profile"));
const SuperAdminLayout = lazy(() => import("../layouts/SuperAdminLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const MentorLayout = lazy(() => import("../layouts/MentorLayout"));
const InternLayout = lazy(() => import("../layouts/InternLayout"));
const PublicUserLayout = lazy(() => import("../layouts/PublicUserLayout"));

const SuperAdminDashboard = lazy(() => import("../pages/superadmin/Dashboard"));
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
const MentorDashboard = lazy(() => import("../pages/mentor/Dashboard"));
const InternDashboard = lazy(() => import("../pages/intern/Dashboard"));
const PublicUserDashboard = lazy(
  () => import("../pages/public-user/Dashboard"),
);

const AvailableCompanies = lazy(() => import("../pages/public-user/Companies"));
const MyRequests = lazy(() => import("../pages/public-user/MyRequests"));
const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  "SUPER_ADMIN",
                  "INTERN",
                  "MENTOR",
                  "ADMIN",
                  "PUBLIC_USER",
                ]}
              />
            }
          >
            <Route path="/change-password" element={<ForceChangePassword />} />
          </Route>

          {/* Super Admin */}
          <Route element={<RoleRoute allowedRoles={["SUPER_ADMIN"]} />}>
            <Route path="/superadmin" element={<SuperAdminLayout />}>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="companies" element={<Companies />} />
              <Route path="report" element={<SuperAdminFinance />} />
              <Route path="pending-review" element={<PendingReviews />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="interns" element={<Interns />} />
              <Route path="mentors" element={<Mentors />} />
              <Route path="programs" element={<Programs />} />
              <Route path="finance" element={<AdminFinance />} />
              <Route path="requests" element={<JoinRequest/>}/>
              <Route path="reviews" element={<CompanyReviews />} />
            </Route>
          </Route>

          {/* Mentor */}
          <Route element={<RoleRoute allowedRoles={["MENTOR"]} />}>
            <Route path="/mentor" element={<MentorLayout />}>
              <Route index element={<MentorDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="programs" element={<MentorPrograms />} />
              <Route path="tasks" element={<MentorTasks />} />
              <Route path="interns" element={<MentorInterns />} />
              <Route path="performance" element={<InternPerformance />} />
            </Route>
          </Route>

          {/* Intern */}
          <Route element={<RoleRoute allowedRoles={["INTERN"]} />}>
            <Route path="/intern" element={<InternLayout />}>
              <Route index element={<InternDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="myProgram" element={<InternPrograms />} />
              <Route path="tasks" element={<InternTasks />} />
              <Route path="performance" element={<Performance />} />
              <Route path="certificate" element={<Certificate />} />
              <Route path="payments" element={<InternPayments />} />
              <Route path="review" element={<InternCreateReview />} />
            </Route>
          </Route>

          {/* Public User */}
          <Route element={<RoleRoute allowedRoles={["PUBLIC_USER"]} />}>
            <Route path="/public_user" element={<PublicUserLayout />}>
              <Route index element={<PublicUserDashboard />} />
              <Route path="companies" element={<AvailableCompanies />} />
              <Route path="my-requests" element={<MyRequests />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
