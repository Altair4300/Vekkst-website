import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Outlet } from 'react-router'
import Layout from './components/Layout'

// Lazy load all pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Account = lazy(() => import('./pages/Account'));
const QuoteForm = lazy(() => import('./pages/QuoteForm'));
const TrackQuote = lazy(() => import('./pages/TrackQuote'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const CustomerReviews = lazy(() => import('./pages/CustomerReviews'));

// Loading fallback for lazy routes
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Admin is now a separate service at vekkst-admin-vkkst.up.railway.app
function AdminRedirect() {
  useEffect(() => {
    window.location.href = "https://vekkst-admin-vkkst.up.railway.app";
  }, []);
  return <div className="min-h-screen flex items-center justify-center bg-black text-white">Redirecting to admin panel...</div>;
}

function LayoutWrapper() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<LayoutWrapper />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/quote" element={<QuoteForm />} />
        <Route path="/quote/:productRef" element={<QuoteForm />} />
        <Route path="/track-quote" element={<TrackQuote />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/returns" element={<ReturnPolicy />} />
        <Route path="/shipping" element={<ShippingPolicy />} />
        <Route path="/customer-reviews" element={<CustomerReviews />} />
      </Route>
      <Route path="/admin" element={<AdminRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/account" element={<Account />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
