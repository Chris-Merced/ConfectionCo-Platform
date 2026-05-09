import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import OrderForm from "../components/orderForm";
import LocationMap from "../components/LocationMap";
import "../styles.css";

export default function Main(): ReactElement {

    return (
        <>
            <div className="main">We have made it to main display</div>
            <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                    <OrderForm />
                </div>
                <div style={{ flex: 1 }}>
                    <LocationMap />
                </div>
            </div>
            <div>
                <Link to="/privacy-policy">Privacy Policy</Link>
                {" · "}
                <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
            </div>
        </>
    )
}
