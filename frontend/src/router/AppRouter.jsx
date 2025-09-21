import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

// ✅ Public Pages
import Home from "@pages/Home";
import About from "@pages/About";
import Product from "@pages/Product";
import Offers from "@pages/Offers";
import Contact from "@pages/Contact";

// ✅ Shop Owner Pages
import LoginPage from "@pages/LoginPage";
import DashBoard from "@dashboard/DashBoard";
import OffersAdmin from "@dashboard/OffersAdmin"; // ✅ Shop owner manages offers

// ✅ Company Admin Pages
import CompanyAdmin from "@pages/CompanyAdmin";
import CompanyAdminLogin from "@pages/CompanyAdminLogin";

// ✅ Shared Components
import Header from "@components/Header";
import Footer from "@components/Footer";

// ==================== Layout Wrapper ====================
function Layout({ children }) {
  const location = useLocation();

  // hide Header/Footer on dashboard and login/admin routes
  const hideHeaderFooter =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/company-admin") ||
    location.pathname.startsWith("/admin-login") ||
    location.pathname.startsWith("/owner-login"); // ✅ hide Shop Owner login

  return (
    <>
      {!hideHeaderFooter && <Header />}
      {children}
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

// ==================== Protected Route for Shop Owner ====================
function PrivateRoute({ children }) {
  const loggedInOwner = localStorage.getItem("loggedInOwner");
  return loggedInOwner ? children : <Navigate to="/owner-login" replace />;
}

// ==================== Protected Route for Company Admin ====================
function AdminRoute({ children }) {
  const isAdmin = localStorage.getItem("isAdmin");
  return isAdmin ? children : <Navigate to="/admin-login" replace />;
}

// ==================== App Router ====================
export default function AppRouter() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* ==================== Public (Customer Facing) ==================== */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/product" element={<Product />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/contact" element={<Contact />} />

          {/* ==================== Shop Owner ==================== */}
          <Route path="/owner-login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashBoard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/offers"
            element={
              <PrivateRoute>
                <OffersAdmin />
              </PrivateRoute>
            }
          />

          {/* ==================== Company Admin ==================== */}
          <Route path="/admin-login" element={<CompanyAdminLogin />} />
          <Route
            path="/company-admin"
            element={
              <AdminRoute>
                <CompanyAdmin />
              </AdminRoute>
            }
          />

          {/* ==================== Fallback ==================== */}
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </Layout>
    </Router>
  );
}
