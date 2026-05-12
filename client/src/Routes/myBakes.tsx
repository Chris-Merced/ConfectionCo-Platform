import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import "../styles.css";

const SECTIONS = [
    {
        label: "Macarons",
        images: [
            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/macarons/IMG_20260512_124351_1.jpg",
            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/macarons/IMG_20260512_130708_1.jpg",
            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/macarons/IMG_20260512_130708_2.jpg",
            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/macarons/IMG_20260512_130708.jpg",
            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/macarons/IMG_20260512_130709_1.jpg",
            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/macarons/IMG_20260512_130709_2.jpg",
            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/macarons/IMG_20260512_130709_3.jpg",
            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/macarons/IMG_20260512_130709.jpg",
        ],
    },
    {
        label: "Pies",
        images: [
            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/pies/12351232.jpg",
            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/pies/IMG_20260512_130237_3.jpg",
            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/pies/IMG_20260512_130237_4.jpg",
            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/pies/IMG_20260512_130237.jpg",
            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/pies/Pies.jpg",
        ],
    },
    {
        label: "More Treats",
        images: [
            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/miscellaneous/IMG_20260512_160144.jpg",
            "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/miscellaneous/IMG_20260512_160146.jpg",
        ],
    },
];

export default function MyBakes(): ReactElement {
    return (
        <>
            <section className="gallery-hero">
                <span className="gallery-eyebrow">from my kitchen</span>
                <h1 className="gallery-heading">My Bakes</h1>
                <div className="gallery-rule" aria-hidden="true" />
                <p className="gallery-subtext">
                    Macarons, pies, and everything in between — all made with the same love from scratch.
                </p>
            </section>

            <section className="gallery-canvas">
                {SECTIONS.map(({ label, images }) => (
                    <div key={label} className="bakes-section">
                        <div className="bakes-section-header">
                            <span className="bakes-section-label">{label}</span>
                            <div className="bakes-section-rule" aria-hidden="true" />
                        </div>
                        <div className="gallery-grid">
                            {images.map((src, i) => (
                                <div key={i} className="gallery-item">
                                    <img
                                        src={src}
                                        alt={`${label} ${i + 1}`}
                                        className="gallery-img"
                                        loading="lazy"
                                        onLoad={(e) => e.currentTarget.classList.add("loaded")}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="gallery-cta-wrap">
                    <p className="gallery-cta-text">Ready to place an order?</p>
                    <Link to="/#order" className="hero-cta">Order Now</Link>
                </div>
            </section>
        </>
    );
}
