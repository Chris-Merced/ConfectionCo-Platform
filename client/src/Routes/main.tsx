import { useEffect, useState, type ReactElement } from "react";
import OrderForm from "../components/orderForm";
import "../styles.css";

export default function Main(): ReactElement {
    
    return (
        <>
            <div className="main">We have made it to main display</div>
            <></>
            <OrderForm />
        </>
    )
}
