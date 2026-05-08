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

  const handleGetPaymentUrl = () =>
    run(async () => {
      const res = await fetch(`http://localhost:8080/api/admin/orders/${order.id}/payment-url`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPaymentUrl(data.url);
    });

  const handleRefund = () =>
    run(async () => {
      await post(`/api/admin/orders/${order.id}/refund`, {
        amount: parseFloat(amount),
      });
      setAmount("");
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
        <div style={styles.actions}>
          <p style={{ ...styles.waiting, margin: 0 }}>Waiting for customer to pay deposit.</p>
          <button style={styles.btnCopy} onClick={handleGetPaymentUrl} disabled={loading}>
            Show Link
          </button>
        </div>
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

      {order.status === "PAID_IN_FULL" && (
        <div style={{ ...styles.actions, marginTop: "1rem", borderTop: "1px solid #374151", paddingTop: "0.75rem" }}>
          {order.totalAmount != null && (
            <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
              Order total: ${order.totalAmount.toFixed(2)}
            </span>
          )}
          <input
            style={styles.input}
            type="number"
            placeholder="Refund amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
          />
          <button style={styles.btnRefund} onClick={handleRefund} disabled={loading || !amount}>
            Issue Refund
          </button>
        </div>
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
    border: "1px solid #374151",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "0.75rem",
    background: "#111827",
    color: "#f3f4f6",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  date: { color: "#6b7280", fontSize: "0.85rem" },
  field: { margin: "0.2rem 0", fontSize: "0.9rem", color: "#d1d5db" },
  actions: { marginTop: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" },
  input: { padding: "0.4rem", borderRadius: "4px", border: "1px solid #4b5563", background: "#1f2937", color: "#f3f4f6", width: "180px" },
  btnAccept: { padding: "0.4rem 0.9rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  btnReject: { padding: "0.4rem 0.9rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  btnCopy: { padding: "0.3rem 0.7rem", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", flexShrink: 0 },
  btnRefund: { padding: "0.4rem 0.9rem", background: "#b45309", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  waiting: { color: "#6b7280", fontStyle: "italic", marginTop: "0.5rem" },
  photos: { display: "flex", gap: "0.5rem", flexWrap: "wrap" as const, marginTop: "0.75rem" },
  thumbnail: { width: "80px", height: "80px", objectFit: "cover" as const, borderRadius: "4px", display: "block" },
  urlBox: { marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", background: "#1f2937", padding: "0.5rem", borderRadius: "4px", border: "1px solid #374151" },
  urlText: { fontSize: "0.8rem", wordBreak: "break-all", flex: 1, color: "#93c5fd" },
  error: { color: "#f87171", fontSize: "0.85rem", marginTop: "0.5rem" },
};
