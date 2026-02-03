import { createRoot } from "react-dom/client";
import "./styles.css";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";

function App(): ReactElement{
  const [response, setResponse] = useState("not ok");
  
 useEffect(()=>{
  async function getRoute(){
    try{
    const res = await fetch("http://localhost:8080/api/base")
    console.log(res)
    const data = await res.json()
    console.log(data)

    setResponse(data.status)
    }catch(err){

      console.error("Error fetching route: " + err)
    }
  }
  
  
  getRoute();
 },[]) 
  
  
  return (
    <>
    <h1>ConfectionCo</h1>
    <span>{response}</span>
  </>
  )
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing in index.html");
}

const root = createRoot(container);
root.render(<App />);