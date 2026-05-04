import type { ReactElement } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import  Header  from "./components/header";
import Main  from "./components/main";
import {BrowserRouter} from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import {lazy, Suspense} from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import "./styles.css";

const AdminDashboard = lazy((): any=> import("./components/adminDashboard"))
//TODO: Create Router and import to app function
// Create EmailService
// Utilize Resend as an email service
function App(): ReactElement {

  

  return (
    <>
      <StrictMode>
        <Auth0Provider
                domain="dev-oayu8epftihuelj1.us.auth0.com"
                clientId="dxRIYZwKz8Zh790ccHzAwctQ3JcqJe1T"
                authorizationParams={{ redirect_uri: window.location.origin }}
              >
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<><Header /><Main /></>} />
              
                <Route path="/admin" element={<AdminDashboard/>} />
              
              <Route path="*" element={<div>Page not found</div>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </Auth0Provider>
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