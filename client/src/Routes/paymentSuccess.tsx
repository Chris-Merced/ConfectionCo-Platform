import { useEffect, useState } from "react";

export default function PaymentSuccess() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          window.location.href = "/";
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="status-page">
      <div className="status-body">
        <div className="status-card">
          <span className="status-icon">🎂</span>
          <h1 className="status-title">Payment Successful</h1>
          {orderId && (
            <p className="status-text" style={{ marginBottom: "0.5rem" }}>
              Order #{orderId}
            </p>
          )}
          <p className="status-text">
            We're confirming your payment and will be in touch soon. Redirecting you home in{" "}
            <span className="status-countdown">{seconds}</span>…
          </p>
        </div>
      </div>
    </div>
  );
}
