import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import OrderForm from "../components/orderForm";
import LocationMap from "../components/LocationMap";
import "../styles.css";

export default function Main(): ReactElement {
    return (
        <>
            <section className="hero">
                <h1 className="hero-title">Custom Cakes &amp; Confections</h1>
                <p className="hero-subtitle">
                    Handcrafted with love for every occasion. Place your order below and we'll be in touch to bring your vision to life.
                </p>
            </section>

            <div className="page-content">
                <div className="order-section">
                    <div className="order-section-form">
                        <h2 className="section-heading">Place an Order</h2>
                        <OrderForm />
                    </div>
                    <div className="order-section-map">
                        <p className="order-section-map-label">Hodges Bayou Plantation — Panama City, FL</p>
                        <LocationMap />
                    </div>
                </div>
            </div>

            <footer className="footer">
                <p className="footer-contact">
                    Have questions about ordering?{" "}
                    <a href="mailto:hello@confectioncobakery.com">hello@confectioncobakery.com</a>
                </p>
                <nav className="footer-links">
                    <Link to="/privacy-policy">Privacy Policy</Link>
                    <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
                </nav>
            </footer>
        </>
    );
}
