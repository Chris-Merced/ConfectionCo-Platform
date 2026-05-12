import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import "../styles.css";

const CAKE_IMAGES = [
    
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124337_6.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124348_10.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124348_3.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124348_7.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124349_1.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124349_2.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124349_3.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124350_4.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124349_6.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124349_7.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124349_8.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124349_9.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124349.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124350_1.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124350_5.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124350_7.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124351_2.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124351_3.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124351.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124337_1.jpg",
    "https://confectioncobakery-assets-859780942726-us-east-2-an.s3.us-east-2.amazonaws.com/cakes/IMG_20260512_124349_4.jpg",

];
export default function Cakes(): ReactElement {
    return (
        <>
            <section className="gallery-hero">
                <span className="gallery-eyebrow">handcrafted with love</span>
                <h1 className="gallery-heading">The Cake Gallery</h1>
                <div className="gallery-rule" aria-hidden="true" />
                <p className="gallery-subtext">
                    A peek at some of our favorite creations — every one made entirely from scratch.
                </p>
            </section>

            <section className="gallery-canvas">
                <div className="gallery-grid">
                    {CAKE_IMAGES.map((src, i) => (
                        <div key={i} className="gallery-item">
                            <img
                                src={src}
                                alt={`Custom cake ${i + 1}`}
                                className="gallery-img"
                                loading="lazy"
                                onLoad={(e) => e.currentTarget.classList.add("loaded")}
                            />
                        </div>
                    ))}
                </div>

                <div className="gallery-cta-wrap">
                    <p className="gallery-cta-text">Love what you see?</p>
                    <Link to="/#order" className="hero-cta">Place an Order</Link>
                </div>
            </section>
        </>
    );
}
