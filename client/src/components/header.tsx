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
                <Link to="/cakes" className="header-nav-link">My Cakes</Link>
                <Link to="/my-bakes" className="header-nav-link">My Bakes</Link>
                <a href="#policies" className="header-nav-link">Policies</a>
                <a href="#order" className="header-nav-cta">Order Now</a>
            </nav>
        </header>
    );
}
