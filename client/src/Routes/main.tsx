import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import OrderForm from "../components/orderForm";
import LocationMap from "../components/LocationMap";
import "../styles.css";

export default function Main(): ReactElement {
    return (
        <>
            <section className="hero">
                <div className="hero-blob" aria-hidden="true" />
                <div className="hero-inner">
                    <span className="hero-eyebrow">handcrafted with love</span>
                    <h1 className="hero-title">
                        Custom Cakes<br />
                        &amp; <em>Confections</em>
                    </h1>
                    <div className="hero-divider" aria-hidden="true">
                        <span className="hero-divider-dot" />
                        <span className="hero-divider-dot" />
                        <span className="hero-divider-dot" />
                    </div>
                    <p className="hero-subtitle">
                        Every order is made from scratch, just for you.
                        Tell us your vision and we'll bring it to life.
                    </p>
                    <a href="#order" className="hero-cta">Place an Order</a>
                </div>
            </section>

            <div className="process-strip">
                <div className="process-strip-inner">
                    <div className="process-step">
                        <div className="process-step-num">01</div>
                        <div className="process-step-title">Tell Us Your Vision</div>
                        <p className="process-step-desc">Fill out our order form with your dream design, occasion, and flavor preferences.</p>
                    </div>
                    <div className="process-arrow" aria-hidden="true">&#8212;&#8212;</div>
                    <div className="process-step">
                        <div className="process-step-num">02</div>
                        <div className="process-step-title">We Craft It</div>
                        <p className="process-step-desc">Our baker handcrafts your order from scratch using quality, fresh ingredients.</p>
                    </div>
                    <div className="process-arrow" aria-hidden="true">&#8212;&#8212;</div>
                    <div className="process-step">
                        <div className="process-step-num">03</div>
                        <div className="process-step-title">Pick Up &amp; Enjoy</div>
                        <p className="process-step-desc">Collect your one-of-a-kind creation and celebrate every moment in style.</p>
                    </div>
                </div>
            </div>

            <div id="order" className="page-content">
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
                <div className="footer-inner">
                    <div>
                        <div className="footer-brand-name">Confection <span>Co</span></div>
                        <span className="footer-tagline">handcrafted with love</span>
                    </div>
                    <div>
                        <p className="footer-col-title">Get in Touch</p>
                        <p className="footer-contact">
                            Have questions about ordering?{" "}
                            <a href="mailto:hello@confectioncobakery.com">hello@confectioncobakery.com</a>
                        </p>
                        <nav className="footer-links">
                            <Link to="/privacy-policy">Privacy Policy</Link>
                            <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
                        </nav>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span className="footer-copy">&copy; {new Date().getFullYear()} Confection Co. All rights reserved.</span>
                </div>
            </footer>
        </>
    );
}
