import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// ✅ Public Pages
import Home from "@pages/Home";
import About from "@pages/About";
import Product from "@pages/Product";
import Offers from "@pages/Offers";       // Customer-facing offers
import LoginPage from "@pages/LoginPage";
import Contact from "@pages/Contact";

// ✅ Components
import Header from "@components/Header";
import Footer from "@components/Footer";

// ✅ Dashboard Pages
   import DashBoard from "@dashboard/DashBoard";
// import InvoicesSection from "@dashboard/InvoicesSection";
// import Notifications from "@dashboard/Notifications";
// import OffersAdmin from "@dashboard/OffersAdmin"; // Admin dashboard offers page

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

export default function AppRouter() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* ✅ Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/product" element={<Product />} />
          <Route path="/offers" element={<Offers />} />   {/* Customer view */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/contact" element={<Contact />} />

          {/* ✅ Dashboard Routes */}
          <Route path="/dashboard" element={<DashBoard />}>
            {/* <Route path="invoices" element={<InvoicesSection />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="offersadmin" element={<OffersAdmin />} /> Admin offers */}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </Layout>
    </Router>
  );
}
