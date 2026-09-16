import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import HomePage from "./pages/HomePage";
import CollectionsPage from "./pages/CollectionsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AppointmentPage from "./pages/AppointmentPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

// Admin imports
import AdminLayout from "./layouts/AdminLayout";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ProductsAdminPage from "./pages/admin/ProductsAdminPage";
import AddEditProductPage from "./pages/admin/AddEditProductPage";
import AppointmentsAdminPage from "./pages/admin/AppointmentsAdminPage";

// Scroll to top helper on navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// 404 Page
function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF8F5] px-4 py-20">
      <div className="text-center max-w-md bg-white border border-[#E0D8CE] p-10 shadow-xs">
        <p className="text-display-lg text-[#C9A96E] mb-2" style={{ fontFamily: "var(--font-display)" }}>
          404
        </p>
        <h1 className="text-xl font-semibold text-[#1C1814] mb-3" style={{ fontFamily: "var(--font-display)" }}>
          Page Not Found
        </h1>
        <p className="text-sm text-[#6B5B4E] mb-6">
          The requested luxury page or collection does not exist or has been moved.
        </p>
        <Link to="/" className="btn-primary">
          Return to Boutique Home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Storefront Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/appointments" element={<AppointmentPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsAdminPage />} />
          <Route path="products/new" element={<AddEditProductPage />} />
          <Route path="products/:id/edit" element={<AddEditProductPage />} />
          <Route path="appointments" element={<AppointmentsAdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
