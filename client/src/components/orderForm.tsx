import { useState, type FormEvent, type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";

interface Option {
    id: number;
    name: string;
}

export default function OrderForm(): ReactElement {
    const [customerName, setCustomerName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [servingCount, setServingCount] = useState("");
    const [comments, setComments] = useState("");
    const [fulfillmentType, setFulfillmentType] = useState<"PICKUP" | "DROPOFF">("PICKUP");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [fulfillmentDate, setFulfillmentDate] = useState("");
    const [photos, setPhotos] = useState<FileList | null>(null);
    const [smsConsent, setSmsConsent] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    function validatePhone(raw: string): boolean {
        const digits = raw.replace(/\D/g, "");
        return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");

        if (!validatePhone(phone)) {
            setError("Please enter a valid 10-digit US phone number.");
            return;
        }

        if (fulfillmentType === "DROPOFF" && !deliveryAddress.trim()) {
            setError("Please enter a delivery address.");
            return;
        }

        if (!fulfillmentDate) {
            setError("Please select a date.");
            return;
        }

        if (photos) {
            for (const photo of Array.from(photos)) {
                if (!ALLOWED_TYPES.includes(photo.type)) {
                    setError("Only JPEG, PNG, and WebP images are allowed. Please remove any GIFs or other file types.");
                    return;
                }
                if (photo.size > MAX_FILE_SIZE) {
                    setError(`"${photo.name}" exceeds the 10MB limit. Please use a smaller file.`);
                    return;
                }
            }
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("customerName", customerName);
        formData.append("email", email);
        formData.append("phoneNumber", phone);
        formData.append("servingCount", servingCount);
        formData.append("fulfillmentType", fulfillmentType);
        formData.append("fulfillmentDate", fulfillmentDate);
        if (fulfillmentType === "DROPOFF") formData.append("deliveryAddress", deliveryAddress);
        if (comments) formData.append("comments", comments);
        formData.append("smsConsent", String(smsConsent));
        if (photos) {
            Array.from(photos).forEach(photo => formData.append("photos", photo));
        }

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const message = await res.text();
                setError(message || "Something went wrong. Please try again.");
                return;
            }
            setSubmitted(true);
        } catch {
            setError("Could not reach the server. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <div className="form-card form-success">
                <p className="form-success-title">Order Received!</p>
                <p className="form-success-text" style={{ marginTop: "0.75rem" }}>Remember to check your spam or junk folder for email correspondence!</p>
            </div>
        );
    }

    return (
        <form className="form-card" onSubmit={handleSubmit}>
            <div className="form-field">
                <label className="form-label" htmlFor="customerName">Name</label>
                <input
                    className="form-input"
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    maxLength={100}
                    required
                />
            </div>

            <div className="form-field">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                    className="form-input"
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="form-field">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <input
                    className="form-input"
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(555) 555-5555"
                    required
                />
            </div>

            <div className="form-field">
                <label className="form-label" htmlFor="servingCount">Number of Guests</label>
                <input
                    className="form-input"
                    id="servingCount"
                    type="number"
                    min="1"
                    max="500"
                    value={servingCount}
                    onChange={e => setServingCount(e.target.value)}
                    required
                />
            </div>

            <div className="form-field">
                <label className="form-label">Fulfillment</label>
                <div className="form-radio-group">
                    <label className={`form-radio-option${fulfillmentType === "PICKUP" ? " selected" : ""}`}>
                        <input
                            type="radio"
                            name="fulfillmentType"
                            value="PICKUP"
                            checked={fulfillmentType === "PICKUP"}
                            onChange={() => setFulfillmentType("PICKUP")}
                        />
                        Pickup
                    </label>
                    <label className={`form-radio-option${fulfillmentType === "DROPOFF" ? " selected" : ""}`}>
                        <input
                            type="radio"
                            name="fulfillmentType"
                            value="DROPOFF"
                            checked={fulfillmentType === "DROPOFF"}
                            onChange={() => setFulfillmentType("DROPOFF")}
                        />
                        Delivery
                    </label>
                </div>
            </div>

            {fulfillmentType === "DROPOFF" && (
                <div className="form-field">
                    <label className="form-label" htmlFor="deliveryAddress">Delivery Address</label>
                    <input
                        className="form-input"
                        id="deliveryAddress"
                        type="text"
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        placeholder="123 Main St, City, State, ZIP"
                        maxLength={500}
                        required
                    />
                </div>
            )}

            <div className="form-field">
                <label className="form-label" htmlFor="fulfillmentDate">
                    {fulfillmentType === "DROPOFF" ? "Delivery Date" : "Pickup Date"}
                </label>
                <input
                    className="form-input"
                    id="fulfillmentDate"
                    type="date"
                    value={fulfillmentDate}
                    onChange={e => setFulfillmentDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                />
            </div>

            <div className="form-field">
                <label className="form-label" htmlFor="photos">Inspiration Photos</label>
                <input
                    className="form-input"
                    id="photos"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={e => setPhotos(e.target.files)}
                />
                <span className="form-file-hint">JPEG, PNG, or WebP · max 10MB each</span>
            </div>

            <div className="form-field">
                <label className="form-label" htmlFor="comments">Order Details</label>
                <textarea
                    className="form-textarea"
                    id="comments"
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    placeholder="Tell us about your vision — Items you want to order (Cakes, Cupcakes, Pies, Macaron's etc..): Amount, flavors, theme, any special requests..."
                    maxLength={2000}
                />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="sms-consent">
                <label className="sms-consent-row">
                    <input
                        type="checkbox"
                        checked={smsConsent}
                        onChange={e => setSmsConsent(e.target.checked)}
                    />
                    <span className="consent-text">
                        <strong>Opt in to receive order status updates via text message from ConfectionCo Bakery.</strong>{" "}
                        Order confirmations and payment links will always be sent to your email. SMS updates are optional and not required to place or complete your order.
                    </span>
                </label>
                <p className="rates-note">
                    Message frequency varies. Msg &amp; data rates may apply.
                    Reply <strong>STOP</strong> to opt out at any time. Reply <strong>HELP</strong> for assistance.
                    View our <a href="/privacy-policy">Privacy Policy</a> and <a href="/terms-and-conditions">Terms &amp; Conditions</a>.
                </p>
            </div>

            <button className="form-submit" type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Order"}
            </button>
        </form>
    );
}
