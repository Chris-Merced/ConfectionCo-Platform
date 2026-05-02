import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { Header } from "./components/header";
import { Main } from "./components/main";
import { AdminDashboard } from "./components/adminDashboard"
import {BrowserRouter} from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import "./styles.css";

//TODO: Create Router and import to app function
// Create EmailService
// Utilize Resend as an email service
function App(): ReactElement {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<><Header /><Main /></>} />
          <Route path="/admin" element={<AdminDashboard/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing in index.html");
}

const root = createRoot(container);
root.render(<App />);