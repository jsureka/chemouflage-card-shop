import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import ProductBrowser from "./components/ProductBrowser";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ProductsProvider } from "./contexts/ProductsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Auth from "./pages/Auth";
import NotePage from "./pages/notes";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import ForgotPassword from "./pages/ForgotPassword";
import Index from "./pages/Index";
import Login from "./pages/Login";
import MyOrders from "./pages/MyOrders";
import NotFound from "./pages/NotFound";
import OrderTracking from "./pages/OrderTracking";
import PaymentCancelled from "./pages/PaymentCancelled";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentSuccess from "./pages/PaymentSuccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ProductDetail from "./pages/ProductDetail";
import RefundPolicy from "./pages/RefundPolicy";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import TermsAndConditions from "./pages/TermsAndConditions";

import {
  AdminCustomers,
  AdminOrders,
  AdminOverview,
  AdminPremiumCodes,
  AdminProducts,
  AdminQuizQuestions,
  AdminQuizStats,
  AdminQuizTopics,
  AdminSettings,
} from "./pages/admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ProductsProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/notes" element={<NotePage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/products" element={<ProductBrowser />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-orders"
                  element={
                    <ProtectedRoute>
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />
                <Route path="/track-order" element={<OrderTracking />} />
                <Route path="/track/:orderId" element={<OrderTracking />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failed" element={<PaymentFailed />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route
                  path="/terms-and-conditions"
                  element={<TermsAndConditions />}
                />
                <Route
                  path="/refund-exchange-policy"
                  element={<RefundPolicy />}
                />
                <Route
                  path="/payment/cancelled"
                  element={<PaymentCancelled />}
                />

                {/* Admin Routes - Protected */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  {" "}
                  <Route index element={<AdminOverview />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="premium-codes" element={<AdminPremiumCodes />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="quiz/topics" element={<AdminQuizTopics />} />
                  <Route
                    path="quiz/questions"
                    element={<AdminQuizQuestions />}
                  />
                  <Route path="quiz/stats" element={<AdminQuizStats />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>{" "}
            </BrowserRouter>
          </TooltipProvider>
        </ProductsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
