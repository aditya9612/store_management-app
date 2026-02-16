import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// Shop Owner Pages
import ShopOwnerLoginPage from "@features/shop-owner/pages/ShopOwnerLoginPage";
import ShopSelectorPage from "@features/shop-owner/pages/ShopSelectorPage";
import DashBoard from "@features/shop-owner/pages/DashboardPage";

// Company Admin Pages
import CompanyAdminPage from "@features/company-admin/pages/CompanyAdmin";
import CompanyAdminLoginPage from "@features/company-admin/pages/CompanyAdminLogin";

// Shared Components
import { ProtectedRoute } from "@shared/components/ProtectedRoute";
import ScrollToTop from "@shared/components/ScrollToTop";

// ==================== Layout Wrapper ====================
function Layout({ children }) {
  return (
    <>
      {children}
    </>
  );
}

// Removed and replaced with shared ProtectedRoute component

// ==================== App Router ====================
export default function AppRouter() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          {/* Default Route - Admin Login */}
          <Route path="/" element={<CompanyAdminLoginPage />} />

          {/* Shop Owner Routes */}
          <Route path="/owner-login" element={<ShopOwnerLoginPage />} />
          <Route
            path="/shop-selector"
            element={
              <ProtectedRoute userType="shop-owner">
                <ShopSelectorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute userType="shop-owner">
                <DashBoard />
              </ProtectedRoute>
            }
          />


          {/* Company Admin Routes */}
          <Route path="/admin-login" element={<CompanyAdminLoginPage />} />
          <Route
            path="/company-admin"
            element={
              <ProtectedRoute userType="company-admin">
                <CompanyAdminPage />
              </ProtectedRoute>
            }
          />

          {/* ==================== Fallback ==================== */}
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </Layout>
    </Router>
  );
}
