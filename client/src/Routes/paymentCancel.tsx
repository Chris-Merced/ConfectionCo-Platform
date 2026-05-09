import { useEffect, useState } from "react";

export default function PaymentCancel() {
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
          <span className="status-icon">🍪</span>
          <h1 className="status-title">Payment Cancelled</h1>
          <p className="status-text">
            No worries — you can try again whenever you're ready. Redirecting you home in{" "}
            <span className="status-countdown">{seconds}</span>…
          </p>
        </div>
      </div>
    </div>
  );
}
