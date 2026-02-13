import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Header } from "./components/header";
import { Main } from "./components/main";
import "./styles.css";
//TODO: Create Router and import to app function
// Create EmailService
// Utilize Resend as an email service
function App(): ReactElement {

  return (
    <>
      <Header />
      <Main/>
    </>
  )
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing in index.html");
}

const root = createRoot(container);
root.render(<App />);