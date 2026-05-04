import type { AppState } from "@auth0/auth0-react";
import type { ReactElement } from "react";

import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/header";
import Main from "./components/main";
import AuthWrapper from "./components/authWrapper";
import "./styles.css";

const AdminDashboard = lazy((): any => import("./components/adminDashboard"))
//TODO: Create Router and import to app function
// Create EmailService
// Utilize Resend as an email service
function App(): ReactElement {

  const onRedirectCallback = (appState?: AppState) => {
    window.location.pathname = appState?.returnTo || "/";
  };

  return (
    <>
      <StrictMode>
        <BrowserRouter>
          <AuthWrapper>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<><Header /><Main /></>} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<div>Page not found</div>} />
              </Routes>
            </Suspense>
          </AuthWrapper>
        </BrowserRouter>

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