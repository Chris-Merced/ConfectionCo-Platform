import { useState, type ReactElement } from "react";

export interface Order {
  id: number;
  email: string;
  phoneNumber: string;
  status: string;
  totalAmount: number | null;
  depositPaid: boolean;
  fullPaymentPaid: boolean;
  servingCount: number;
  comments: string | null;
  createdAt: string;
  photoUrls: string[];
}

interface OrderCardProps {
  order: Order;
  token: string;
  onUpdate: () => void;
}

export default function OrderCard({ order, token, onUpdate }: OrderCardProps): ReactElement {
  const [amount, setAmount] = useState("");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const post = async (path: string, body?: object) => {
    const res = await fetch(`http://localhost:8080${path}`, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  const run = async (action: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await action();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () =>
    run(async () => {
      await post(`/api/admin/orders/${order.id}/reject`);
      onUpdate();
    });

  const handleDepositLink = () =>
    run(async () => {
      const data = await post(`/api/admin/orders/${order.id}/deposit-link`, {
        totalAmount: parseFloat(amount),
      });
      setPaymentUrl(data.url);
      setAmount("");
      onUpdate();
    });

  const handleFinalLink = () =>
    run(async () => {
      const data = await post(`/api/admin/orders/${order.id}/final-link`, {
        amount: parseFloat(amount),
      });
      setPaymentUrl(data.url);
      setAmount("");
      onUpdate();
    });

  const handleComplete = () =>
    run(async () => {
      await post(`/api/admin/orders/${order.id}/complete`);
      onUpdate();
    });

  return (
    <div style={styles.card}>
      <div style={styles.row}>
        <strong>Order #{order.id}</strong>
        <span style={styles.date}>{new Date(order.createdAt).toLocaleDateString()}</span>
      </div>

      <p style={styles.field}>Email: {order.email}</p>
      <p style={styles.field}>Phone: {order.phoneNumber}</p>
      <p style={styles.field}>Servings: {order.servingCount}</p>
      {order.comments && <p style={styles.field}>Comments: {order.comments}</p>}
      {order.totalAmount != null && <p style={styles.field}>Total: ${order.totalAmount.toFixed(2)}</p>}

      {order.photoUrls.length > 0 && (
        <div style={styles.photos}>
          {order.photoUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer">
              <img src={url} alt={`Inspiration ${i + 1}`} style={styles.thumbnail} />
            </a>
          ))}
        </div>
      )}

      {order.status === "PENDING" && (
        <div style={styles.actions}>
          <input
            style={styles.input}
            type="number"
            placeholder="Total amount (e.g. 150.00)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
          />
          <button style={styles.btnAccept} onClick={handleDepositLink} disabled={loading || !amount}>
            Accept
          </button>
          <button style={styles.btnReject} onClick={handleReject} disabled={loading}>
            Reject
          </button>
        </div>
      )}

      {order.status === "AWAITING_DEPOSIT" && (
        <p style={styles.waiting}>Waiting for customer to pay deposit.</p>
      )}

      {order.status === "IN_PROGRESS" && (
        <div style={styles.actions}>
          <input
            style={styles.input}
            type="number"
            placeholder="Final payment amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
          />
          <button style={styles.btnAccept} onClick={handleFinalLink} disabled={loading || !amount}>
            Send Final Payment Link
          </button>
        </div>
      )}

      {order.status === "AWAITING_FINAL_PAYMENT" && (
        <p style={styles.waiting}>Waiting for customer to pay final balance.</p>
      )}

      {order.status === "PAID_IN_FULL" && (
        <button style={styles.btnAccept} onClick={handleComplete} disabled={loading}>
          Mark as Complete
        </button>
      )}

      {paymentUrl && (
        <div style={styles.urlBox}>
          <span style={styles.urlText}>{paymentUrl}</span>
          <button style={styles.btnCopy} onClick={() => navigator.clipboard.writeText(paymentUrl)}>
            Copy Link
          </button>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "0.75rem",
    background: "#fff",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  date: { color: "#888", fontSize: "0.85rem" },
  field: { margin: "0.2rem 0", fontSize: "0.9rem" },
  actions: { marginTop: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" },
  input: { padding: "0.4rem", borderRadius: "4px", border: "1px solid #ccc", width: "180px" },
  btnAccept: { padding: "0.4rem 0.9rem", background: "#4caf50", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  btnReject: { padding: "0.4rem 0.9rem", background: "#e53935", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  btnCopy: { padding: "0.3rem 0.7rem", background: "#1976d2", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", flexShrink: 0 },
  waiting: { color: "#888", fontStyle: "italic", marginTop: "0.5rem" },
  photos: { display: "flex", gap: "0.5rem", flexWrap: "wrap" as const, marginTop: "0.75rem" },
  thumbnail: { width: "80px", height: "80px", objectFit: "cover" as const, borderRadius: "4px", display: "block" },
  urlBox: { marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", background: "#f5f5f5", padding: "0.5rem", borderRadius: "4px" },
  urlText: { fontSize: "0.8rem", wordBreak: "break-all", flex: 1 },
  error: { color: "#e53935", fontSize: "0.85rem", marginTop: "0.5rem" },
};
