// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import ToastContainer from "./components/ui/CustomToast";
import { AuthProvider } from "./context/AuthContext.tsx";
import Login from "./components/Login";
import ChangePassword from "./components/ChangePassword";
import Register from "./pages/register/Register.jsx";
import RegisterRefered from "./pages/register/RegisterRefered.jsx";
import RequestPasswordReset from "./pages/register/RequestPasswordReset.jsx";
import PrivateRoute from "./components/PrivateRoute";
import MainLayout from "./layouts/MainLayout";
import Unauthorized from "./pages/Unauthorized";
import Support from "./pages/support/Support.jsx";
import Home from "./pages/home/Home.jsx";
import Success from "./pages/payment/Success.jsx";
import Cancel from "./pages/payment/Cancel.jsx";
import SuccessRedirect from "./pages/payment/SuccessRedirect";
import CancelRedirect from "./pages/payment/CancelRedirect";
import Payment from "./pages/payment/Payment.tsx";
import Marketplace from "./pages/marketplace/Marketplace.jsx"
import Profile from "./pages/profile/Profile.js";
import Deposits from "./pages/deposits/Deposits.tsx";

function App() {
  return (
    <>
      <ToastContainer position="bottom-right" />
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/refered/:uId" element={<RegisterRefered />} />
          <Route path="/request-password-reset" element={<RequestPasswordReset />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/payment/success-redirect" element={<SuccessRedirect />} />
          <Route path="/payment/cancel-redirect" element={<CancelRedirect />} />
          <Route path="/payment/success" element={<Success />} />
          <Route path="/payment/cancel" element={<Cancel />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route
              path="home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="payments"
              element={
                <PrivateRoute>
                  <Payment />
                </PrivateRoute>
              }
            />
            <Route
              path="deposits"
              element={
                <PrivateRoute>
                  <Deposits />
                </PrivateRoute>
              }
            />
            <Route
              path="marketplace"
              element={
                <PrivateRoute>
                  <Marketplace />
                </PrivateRoute>
              }
            />
            <Route
              path="support"
              element={
                <PrivateRoute>
                  <Support />
                </PrivateRoute>
              }
            />
            <Route
              path="profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            
          </Route>
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
