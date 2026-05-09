import { useState, type FormEvent, type ReactElement } from "react";

export default function OrderForm(): ReactElement {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [servingCount, setServingCount] = useState("");
    const [comments, setComments] = useState("");
    const [fulfillmentType, setFulfillmentType] = useState<"PICKUP" | "DROPOFF">("PICKUP");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [fulfillmentDate, setFulfillmentDate] = useState("");
    const [photos, setPhotos] = useState<FileList | null>(null);
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
        formData.append("email", email);
        formData.append("phoneNumber", phone);
        formData.append("servingCount", servingCount);
        formData.append("fulfillmentType", fulfillmentType);
        formData.append("fulfillmentDate", fulfillmentDate);
        if (fulfillmentType === "DROPOFF") formData.append("deliveryAddress", deliveryAddress);
        if (comments) formData.append("comments", comments);
        if (photos) {
            Array.from(photos).forEach(photo => formData.append("photos", photo));
        }

        try {
            const res = await fetch("http://localhost:8080/api/orders", {
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
        return <p>Your order has been submitted! We'll be in touch soon.</p>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="phone">Phone Number</label>
                <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="servingCount">Number of People Serving</label>
                <input
                    id="servingCount"
                    type="number"
                    min="1"
                    value={servingCount}
                    onChange={e => setServingCount(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Fulfillment</label>
                <div>
                    <label>
                        <input
                            type="radio"
                            name="fulfillmentType"
                            value="PICKUP"
                            checked={fulfillmentType === "PICKUP"}
                            onChange={() => setFulfillmentType("PICKUP")}
                        />
                        {" "}Pickup
                    </label>
                    <label style={{ marginLeft: "1rem" }}>
                        <input
                            type="radio"
                            name="fulfillmentType"
                            value="DROPOFF"
                            checked={fulfillmentType === "DROPOFF"}
                            onChange={() => setFulfillmentType("DROPOFF")}
                        />
                        {" "}Delivery
                    </label>
                </div>
            </div>
            {fulfillmentType === "DROPOFF" && (
                <div>
                    <label htmlFor="deliveryAddress">Delivery Address</label>
                    <input
                        id="deliveryAddress"
                        type="text"
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        placeholder="123 Main St, City, State, ZIP"
                        required
                    />
                </div>
            )}
            <div>
                <label htmlFor="fulfillmentDate">
                    {fulfillmentType === "DROPOFF" ? "Delivery Date" : "Pickup Date"}
                </label>
                <input
                    id="fulfillmentDate"
                    type="date"
                    value={fulfillmentDate}
                    onChange={e => setFulfillmentDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                />
            </div>
            <div>
                <label htmlFor="photos">Inspiration Photos</label>
                <input
                    id="photos"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={e => setPhotos(e.target.files)}
                />
            </div>
            <div>
                <label htmlFor="comments">Order Details</label>
                <textarea
                    id="comments"
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    rows={5}
                />
            </div>
            {error && <p>{error}</p>}
            <button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Order"}
            </button>
        </form>
    );
}
