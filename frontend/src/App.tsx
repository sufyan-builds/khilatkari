import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import { lazy, Suspense } from "react";
import HomePage from "./pages/HomePage";

// Lazy-loaded public pages
const CollectionsPage = lazy(() => import("./pages/CollectionsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const AppointmentPage = lazy(() => import("./pages/AppointmentPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

// Lazy-loaded Admin imports
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const ProductsAdminPage = lazy(() => import("./pages/admin/ProductsAdminPage"));
const AddEditProductPage = lazy(() => import("./pages/admin/AddEditProductPage"));
const AppointmentsAdminPage = lazy(() => import("./pages/admin/AppointmentsAdminPage"));
const VisualsAdminPage = lazy(() => import("./pages/admin/VisualsAdminPage"));
const CategoriesAdminPage = lazy(() => import("./pages/admin/CategoriesAdminPage"));

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
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF8F5]">
            <div className="w-7 h-7 rounded-full border-2 border-[#C9A96E] border-t-transparent animate-spin" />
          </div>
        }
      >
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
            <Route path="visuals" element={<VisualsAdminPage />} />
            <Route path="categories" element={<CategoriesAdminPage />} />
            <Route path="products" element={<ProductsAdminPage />} />
            <Route path="products/new" element={<AddEditProductPage />} />
            <Route path="products/:id/edit" element={<AddEditProductPage />} />
            <Route path="appointments" element={<AppointmentsAdminPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
