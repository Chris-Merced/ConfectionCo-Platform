import type { ReactElement } from "react";
import "../styles.css";

export default function Header(): ReactElement {
    return (
        <header className="header">
            <span className="header-brand">
                Confection <span>Co</span>
            </span>
        </header>
    );
}
