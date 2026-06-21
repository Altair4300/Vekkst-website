import { Routes, Route, Outlet } from 'react-router'
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
import NotFound from './pages/NotFound'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import ReturnPolicy from './pages/ReturnPolicy'
import ShippingPolicy from './pages/ShippingPolicy'
import CustomerReviews from './pages/CustomerReviews'

import Admin from './pages/Admin'

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
      <Route path="/admin" element={<Admin />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/account" element={<Account />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
