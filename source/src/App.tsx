import { Outlet, Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import QuoteForm from './pages/QuoteForm'
import TrackQuote from './pages/TrackQuote'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import CustomerReviews from './pages/CustomerReviews'

// Wraps all public website routes in the shared Layout (TopBar, Navbar, Footer).
// Routes that need their own full-screen UI (Admin, Login, Register, Account)
// are defined as siblings outside this wrapper.
function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public website routes — wrapped in the shared Layout */}
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
        <Route path="/customer-reviews" element={<CustomerReviews />} />
      </Route>

      {/* Standalone routes — rendered without the website Layout */}
      <Route path="/account" element={<Account />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
