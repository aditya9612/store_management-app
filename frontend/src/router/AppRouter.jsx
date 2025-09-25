import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// Customer Pages
import HomePage from "@features/customer/pages/HomePage";
import About from "@features/customer/pages/AboutPage";
import Product from "@features/customer/pages/ProductPage";
import Offers from "@features/customer/pages/OffersPage";
import Contact from "@features/customer/pages/ContactPage";

// Shop Owner Pages
import ShopOwnerLoginPage from "@features/shop-owner/pages/ShopOwnerLoginPage";
import ShopSelectorPage from "@features/shop-owner/pages/ShopSelectorPage";
import DashBoard from "@features/shop-owner/pages/DashboardPage";

// Company Admin Pages
import CompanyAdminPage from "@features/company-admin/pages/CompanyAdmin";
import CompanyAdminLoginPage from "@features/company-admin/pages/CompanyAdminLogin";

// Shared Components
import { ProtectedRoute } from "@shared/components/ProtectedRoute";
import Header from "@shared/components/Header";
import Footer from "@shared/components/Footer";

// ==================== Layout Wrapper ====================
function Layout({ children }) {
  const location = useLocation();

  // hide Header/Footer on dashboard and login/admin routes
  const hideHeaderFooter =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/shop-selector") ||
    location.pathname.startsWith("/company-admin") ||
    location.pathname.startsWith("/admin-login") ||
    location.pathname.startsWith("/owner-login"); // ✅ hide Shop Owner pages

  return (
    <>
      {!hideHeaderFooter && <Header />}
      {children}
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

// Removed and replaced with shared ProtectedRoute component

// ==================== App Router ====================
export default function AppRouter() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes (Customer) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/product" element={<Product />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/contact" element={<Contact />} />

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
