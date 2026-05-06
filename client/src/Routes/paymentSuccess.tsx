export default function PaymentSuccess() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");

  return (
    <div>
      <h1>Payment Successful 🎉</h1>
      <p>Order ID: {orderId}</p>
      <p>We’re confirming your payment…</p>
    </div>
  );
}