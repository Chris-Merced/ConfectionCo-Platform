import type { ReactElement } from "react";
import "../styles.css";

export default function Header(): ReactElement {
    return (
        <header className="header">
            <span className="header-brand">
                Confection <span>Co</span>
            </span>
            <nav className="header-nav">
                <a href="#policies" className="header-nav-link">Policies</a>
                <a href="#order" className="header-nav-cta">Order Now</a>
            </nav>
        </header>
    );
}
