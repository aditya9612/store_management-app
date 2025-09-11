import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";

// ✅ Public Pages
import Home from "@pages/Home";
import About from "@pages/About";
import Product from "@pages/Product";
import Offers from "@pages/Offers";       // Customer-facing offers
import Contact from "@pages/Contact";

// ✅ Shop Owner Pages
import LoginPage from "@pages/LoginPage";
import DashBoard from "@dashboard/DashBoard";

// ✅ Components
import Header from "@components/Header";
import Footer from "@components/Footer";

// ✅ Layout wrapper to hide Header/Footer on Dashboard
function Layout({ children }) {
  const location = useLocation();

  // Hide Header + Footer on all dashboard pages
  const hideHeaderFooter = location.pathname.startsWith("/dashboard");

  return (
    <>
      {!hideHeaderFooter && <Header />}
      {children}
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

// ✅ Protected Route for Shop Owner
function PrivateRoute({ children }) {
  const isOwnerLoggedIn = localStorage.getItem("isOwnerLoggedIn");
  return isOwnerLoggedIn ? children : <Navigate to="/owner-login" replace />;
}

export default function AppRouter() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* ✅ Public Routes (Customer-facing) */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/product" element={<Product />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/contact" element={<Contact />} />

          {/* ✅ Shop Owner Routes (Hidden from customers) */}
          <Route path="/owner-login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashBoard />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </Layout>
    </Router>
  );
}
