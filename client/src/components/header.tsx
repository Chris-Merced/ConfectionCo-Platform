import { useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import "../styles.css";

export default function Header(): ReactElement {
    const [menuOpen, setMenuOpen] = useState(false);

    function closeMenu() {
        setMenuOpen(false);
    }

    return (
        <>
            <header className="header">
                <Link to="/" className="header-brand" onClick={closeMenu}>
                    Confection <span>Co</span>
                </Link>
                <nav className="header-nav">
                    <Link to="/cakes" className="header-nav-link">My Cakes</Link>
                    <Link to="/my-bakes" className="header-nav-link">My Bakes</Link>
                    <Link to={{ pathname: "/", hash: "#policies" }} className="header-nav-link">Policies</Link>
                    <Link to={{ pathname: "/", hash: "#order" }} className="header-nav-cta" onClick={closeMenu}>Order Now</Link>
                    <button
                        className={`header-hamburger${menuOpen ? " is-open" : ""}`}
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </nav>
            </header>
            {menuOpen && (
                <div className="header-mobile-menu">
                    <Link to="/cakes" className="header-mobile-menu-link" onClick={closeMenu}>My Cakes</Link>
                    <Link to="/my-bakes" className="header-mobile-menu-link" onClick={closeMenu}>My Bakes</Link>
                    <Link to={{ pathname: "/", hash: "#policies" }} className="header-mobile-menu-link" onClick={closeMenu}>Policies</Link>
                </div>
            )}
        </>
    );
}
