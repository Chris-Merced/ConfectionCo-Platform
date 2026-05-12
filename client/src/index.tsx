import type { ReactElement } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import AuthWrapper from "./components/authWrapper";
import Header from "./components/header";
import Cakes from "./Routes/cakes";
import Main from "./Routes/main";
import PaymentCancel from "./Routes/paymentCancel";
import PaymentSuccess from "./Routes/paymentSuccess";
import PrivacyPolicy from "./Routes/privacyPolicy";
import TermsAndConditions from "./Routes/termsAndConditions";
import "./styles.css";

const AdminDashboard = lazy((): any => import("./Routes/adminDashboard"))
function App(): ReactElement {

  const queryClient = new QueryClient();

  return (
    <>
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthWrapper>
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<><Header /><Main /></>} />
                  <Route path="/cakes" element={<><Header /><Cakes /></>} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/payment-success" element={<><Header /><PaymentSuccess /></>} />
                  <Route path="/payment-cancel" element={<><Header /><PaymentCancel /></>} />
                  <Route path="/privacy-policy" element={<><Header /><PrivacyPolicy /></>} />
                  <Route path="/terms-and-conditions" element={<><Header /><TermsAndConditions /></>} />
                  <Route path="*" element={<div>Page not found</div>} />
                </Routes>
              </Suspense>
            </AuthWrapper>
          </BrowserRouter>
        </ QueryClientProvider>
      </StrictMode>
    </>
  )
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing in index.html");
}

const root = createRoot(container);
root.render(<App />);