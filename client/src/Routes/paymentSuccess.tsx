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
    <div>
      <h1>Payment Successful</h1>
      {orderId && <p>Order ID: {orderId}</p>}
      <p>We’re confirming your payment. Redirecting you home in {seconds}…</p>
    </div>
  );
}