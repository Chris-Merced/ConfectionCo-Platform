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
    <div>
      <h1>Payment Cancelled</h1>
      <p>You can try again when you're ready. Redirecting you home in {seconds}…</p>
    </div>
  );
}