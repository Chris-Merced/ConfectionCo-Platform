import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import "../styles.css";

export default function Header(): ReactElement {
    return (
        <header className="header">
            <Link to="/" className="header-brand">
                Confection <span>Co</span>
            </Link>
            <nav className="header-nav">
                <Link to="/cakes" className="header-nav-link">Cakes</Link>
                <a href="#policies" className="header-nav-link">Policies</a>
                <a href="#order" className="header-nav-cta">Order Now</a>
            </nav>
        </header>
    );
}
