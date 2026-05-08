import { useState, type FormEvent, type ReactElement } from "react";

export default function OrderForm(): ReactElement {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [servingCount, setServingCount] = useState("");
    const [comments, setComments] = useState("");
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
        if (comments) formData.append("comments", comments);
        if (photos) {
            Array.from(photos).forEach(photo => formData.append("photos", photo));
        }

        try {
            const res = await fetch("http://localhost:8080/api/orders", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Submission failed");
            setSubmitted(true);
        } catch {
            setError("Something went wrong. Please try again.");
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
