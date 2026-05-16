import type { ReactElement } from "react";
import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import OrderForm from "../components/orderForm";
import LocationMap from "../components/LocationMap";
import "../styles.css";

export default function Main(): ReactElement {
    const heroRef = useRef<HTMLElement>(null);
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const el = document.querySelector(hash);
            if (el) el.scrollIntoView({ behavior: "smooth" });
            window.history.replaceState(null, "", window.location.pathname);
        }
    }, [hash]);

    useEffect(() => {
        const el = heroRef.current;
        if (!el) return;

        let rafId: number;
        const onScroll = () => {
            if (window.innerWidth <= 768) return;
            rafId = requestAnimationFrame(() => {
                el.style.setProperty("--dot-parallax", `${window.scrollY * 0.5}px`);
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <>
            <section className="hero" ref={heroRef}>
                <div className="hero-blob" aria-hidden="true" />
                <div className="hero-inner">
                    <span className="hero-eyebrow">handcrafted with love</span>
                    <h1 className="hero-title">
                        Custom Cakes &amp; <em>Confections</em><br />
                        <span className="hero-title-by">by Confection Co. Bakery</span>
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
                        <div className="process-step-title">Pick Up or Delivery!</div>
                        <p className="process-step-desc">Either pickup or delivery for your one-of-a-kind creation and celebrate in style.</p>
                    </div>
                </div>
            </div>

            <section className="story-section">
                <div className="story-inner">
                    <div className="story-content">
                        <span className="story-eyebrow">meet the baker</span>
                        <h2 className="story-heading">Hello, I'm Isabel.</h2>
                        <div className="story-rule" aria-hidden="true" />
                        <p className="story-body">
                            Born and raised on the shores of Panama City Beach, Florida,
                            Isabel discovered her love for confections long before she ever put
                            on a chef's coat. A trained pastry chef, devoted wife, and proud mother of
                            two, she pours the same warmth into every bake that she gives to the people
                            she loves most. Confection Co. Bakery is her way of sharing that sweetness
                            with her community with one handcrafted creation at a time. From showstopping
                            custom cakes and dainty macarons to silky cheesecakes and flaky pies, every
                            bake is made entirely from scratch. Each order is a little piece of her heart,
                            crafted just for you.
                        </p>
                        <div className="story-tags">
                            <span className="story-tag">Cakes</span>
                            <span className="story-tag">Macarons</span>
                            <span className="story-tag">Cheesecakes</span>
                            <span className="story-tag">Pies</span>
                            <span className="story-tag">And More!</span>
                        </div>
                    </div>
                    <div className="story-photo-wrap">
                        <img
                            className="story-photo"
                            src="https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/headshots/IMG_20260512_131123.jpg"
                            alt="Isabel Merced, founder of Confection Co. Bakery"
                        />
                    </div>
                </div>
            </section>

            <section className="preview-section">
                <div className="preview-header">
                    <div>
                        <span className="preview-eyebrow">custom creations</span>
                        <h2 className="preview-heading">My Cakes</h2>
                    </div>
                    <Link to="/cakes" className="preview-view-all">View Gallery →</Link>
                </div>
                <div className="preview-body">
                    <div className="preview-strip">
                        {[
                            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124350_4.jpg",
                            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124350_7.jpg",
                            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124348_3.jpg",
                        ].map((src, i) => (
                            <div key={i} className="preview-card">
                                <img
                                    src={src}
                                    alt={`Cake ${i + 1}`}
                                    className="preview-img"
                                    loading="lazy"
                                    onLoad={(e) => e.currentTarget.classList.add("loaded")}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="preview-section preview-section--alt">
                <div className="preview-header">
                    <div>
                        <span className="preview-eyebrow">from my kitchen</span>
                        <h2 className="preview-heading">My Bakes</h2>
                    </div>
                    <Link to="/my-bakes" className="preview-view-all">View Gallery →</Link>
                </div>
                <div className="preview-body">
                    <div className="preview-strip">
                        {[
                            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/miscellaneous/IMG_20260512_160144.jpg",
                            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/pies/12351232.jpg",
                            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/macarons/IMG_20260512_124351_1.jpg",
                        ].map((src, i) => (
                            <div key={i} className="preview-card">
                                <img
                                    src={src}
                                    alt={`Bake ${i + 1}`}
                                    className="preview-img"
                                    loading="lazy"
                                    onLoad={(e) => e.currentTarget.classList.add("loaded")}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="policies" className="policies-section">
                <div className="policies-inner">
                    <div className="policies-photo-wrap">
                        <img
                            className="policies-photo"
                            src="https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/msedge_D5fL9k2ng0.png"
                            alt="Confection Co. Bakery custom cake"
                        />
                    </div>
                    <div className="policies-content">
                        <span className="policies-eyebrow">before you order</span>
                        <h2 className="policies-heading">Policies &amp; Booking</h2>
                        <div className="policies-rule" aria-hidden="true" />
                        <ul className="policies-list">
                            <li className="policies-item">
                                <span className="policies-item-label">Deposit</span>
                                <span className="policies-item-text">
                                    Non-refundable 40% of your order is required to secure the date.
                                    Remaining balance is due a week before pick up/delivery! Orders less
                                    than a week away must pay in full, no exceptions, and are subject to a
                                    rush fee. No deposit, no order.
                                </span>
                            </li>
                            <li className="policies-item">
                                <span className="policies-item-label">Pick Up</span>
                                <span className="policies-item-text">
                                    Pick up is between the hours of 10am–4pm, located in Hodges Bayou
                                    Plantation in Southport. Address will be given once full payment has
                                    been completed! Late pick ups will be charged a late fee of $20/hr
                                    (w/ 10–15 min grace period).
                                </span>
                            </li>
                            <li className="policies-item">
                                <span className="policies-item-label">Cancellations</span>
                                <span className="policies-item-text">
                                    Deposits are final. Cancellations less than a week's notice will
                                    result in no refund, no exceptions!
                                </span>
                            </li>
                            <li className="policies-item">
                                <span className="policies-item-label">Changes</span>
                                <span className="policies-item-text">
                                    You are able to make changes to your order up to two weeks prior to
                                    pick up or delivery!
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <div id="order" className="page-content">
                <div className="order-section">
                    <div className="order-section-form">
                        <h2 className="section-heading">Place an Order</h2>
                        <p className="order-delivery-notice">We deliver all across the Emerald Coast.</p>
                        <p className="order-policy-notice">
                            By ordering you agree that you have read the{" "}
                            <a href="#policies" className="order-policy-link">
                                Policies &amp; Booking
                            </a>{" "}
                            section.
                        </p>
                        <OrderForm />
                    </div>
                    <div className="order-section-map">
                        <p className="order-section-map-label">Hodges Bayou Plantation — Southport, FL</p>
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
