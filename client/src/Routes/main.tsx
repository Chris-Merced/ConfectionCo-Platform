import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import OrderForm from "../components/orderForm";
import "../styles.css";

export default function Main(): ReactElement {

    return (
        <>
            <div className="main">We have made it to main display</div>
            <OrderForm />
            <div>
                <Link to="/privacy-policy">Privacy Policy</Link>
                {" · "}
                <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
            </div>
        </>
    )
}
