import { useState, type ReactElement } from "react";
import { useMutation } from "@tanstack/react-query";

export interface Order {
  id: number;
  email: string;
  phoneNumber: string;
  status: string;
  totalAmount: number | null;
  finalPaymentAmount: number | null;
  depositPaid: boolean;
  fullPaymentPaid: boolean;
  servingCount: number;
  comments: string | null;
  fulfillmentType: string;
  deliveryAddress: string | null;
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
  const [editingComments, setEditingComments] = useState(false);
  const [comments, setComments] = useState(order.comments ?? "");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

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

  const rejectMutation = useMutation({
    mutationFn: () => post(`/api/admin/orders/${order.id}/reject`),
    onSuccess: onUpdate,
  });

  const depositLinkMutation = useMutation({
    mutationFn: () => post(`/api/admin/orders/${order.id}/deposit-link`, { totalAmount: parseFloat(amount) }),
    onSuccess: (data) => { setPaymentUrl(data.url); setAmount(""); onUpdate(); },
  });

  const finalLinkMutation = useMutation({
    mutationFn: () => post(`/api/admin/orders/${order.id}/final-link`, { amount: parseFloat(amount) }),
    onSuccess: (data) => { setPaymentUrl(data.url); setAmount(""); onUpdate(); },
  });

  const completeMutation = useMutation({
    mutationFn: () => post(`/api/admin/orders/${order.id}/complete`),
    onSuccess: onUpdate,
  });

  const refundMutation = useMutation({
    mutationFn: () => post(`/api/admin/orders/${order.id}/refund`, { amount: parseFloat(amount) }),
    onSuccess: () => { setAmount(""); onUpdate(); },
  });

  const paymentUrlMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`http://localhost:8080/api/admin/orders/${order.id}/payment-url`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => setPaymentUrl(data.url),
  });

  const commentsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`http://localhost:8080/api/admin/orders/${order.id}/comments`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ comments }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => { setEditingComments(false); onUpdate(); },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`http://localhost:8080/api/admin/orders/${order.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: onUpdate,
  });

  const handleDelete = () => {
    if (!window.confirm(`Remove order #${order.id}? This cannot be undone.`)) return;
    deleteMutation.mutate();
  };

  const isAnyPending =
    rejectMutation.isPending ||
    depositLinkMutation.isPending ||
    finalLinkMutation.isPending ||
    completeMutation.isPending ||
    refundMutation.isPending ||
    paymentUrlMutation.isPending ||
    commentsMutation.isPending ||
    deleteMutation.isPending;

  const activeError = (
    rejectMutation.error ||
    depositLinkMutation.error ||
    finalLinkMutation.error ||
    completeMutation.error ||
    refundMutation.error ||
    paymentUrlMutation.error ||
    commentsMutation.error ||
    deleteMutation.error
  ) as Error | null;

  return (
    <div style={styles.card}>
      <div style={styles.row}>
        <strong>Order #{order.id}</strong>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={styles.date}>{new Date(order.createdAt).toLocaleDateString()}</span>
          <button style={styles.btnDelete} onClick={handleDelete} disabled={isAnyPending} title="Remove order">
            ✕
          </button>
        </div>
      </div>

      <p style={styles.field}>Email: {order.email}</p>
      <p style={styles.field}>Phone: {order.phoneNumber}</p>
      <p style={styles.field}>Servings: {order.servingCount}</p>
      <p style={styles.field}>
        Fulfillment: {order.fulfillmentType === "DROPOFF" ? "Delivery" : "Pickup"}
      </p>
      {order.deliveryAddress && (
        <p style={styles.field}>
          Delivery Address:{" "}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#93c5fd" }}
          >
            {order.deliveryAddress}
          </a>
        </p>
      )}
      {order.totalAmount != null && <p style={styles.field}>Total: ${order.totalAmount.toFixed(2)}</p>}

      <div style={{ margin: "0.2rem 0" }}>
        {editingComments ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <textarea
              style={{ ...styles.input, width: "100%", resize: "vertical", minHeight: "60px" }}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button style={styles.btnAccept} onClick={() => commentsMutation.mutate()} disabled={isAnyPending}>Save</button>
              <button style={styles.btnReject} onClick={() => { setComments(order.comments ?? ""); setEditingComments(false); }} disabled={isAnyPending}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <p style={{ ...styles.field, margin: 0, flex: 1 }}>
              Comments: {comments || <em style={{ color: "#6b7280" }}>none</em>}
            </p>
            <button style={styles.btnDelete} onClick={() => setEditingComments(true)}>Edit</button>
          </div>
        )}
      </div>

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
          <button style={styles.btnAccept} onClick={() => depositLinkMutation.mutate()} disabled={isAnyPending || !amount}>
            Accept
          </button>
          <button style={styles.btnReject} onClick={() => rejectMutation.mutate()} disabled={isAnyPending}>
            Reject
          </button>
        </div>
      )}

      {order.status === "AWAITING_DEPOSIT" && (
        <div style={styles.actions}>
          <p style={{ ...styles.waiting, margin: 0 }}>Waiting for customer to pay deposit.</p>
          <button style={styles.btnCopy} onClick={() => paymentUrlMutation.mutate()} disabled={isAnyPending}>
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
          <button style={styles.btnAccept} onClick={() => finalLinkMutation.mutate()} disabled={isAnyPending || !amount}>
            Send Final Payment Link
          </button>
        </div>
      )}

      {order.status === "AWAITING_FINAL_PAYMENT" && (
        <div style={styles.actions}>
          <p style={{ ...styles.waiting, margin: 0 }}>Waiting for customer to pay final balance.</p>
          <button style={styles.btnCopy} onClick={() => paymentUrlMutation.mutate()} disabled={isAnyPending}>
            Show Link
          </button>
        </div>
      )}

      {order.status === "PAID_IN_FULL" && (
        <button style={styles.btnAccept} onClick={() => completeMutation.mutate()} disabled={isAnyPending}>
          Mark as Complete
        </button>
      )}

      {order.status === "PAID_IN_FULL" && (
        <div style={{ ...styles.actions, marginTop: "1rem", borderTop: "1px solid #374151", paddingTop: "0.75rem" }}>
          {order.finalPaymentAmount != null && (
            <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
              Final payment: ${order.finalPaymentAmount.toFixed(2)}
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
          <button style={styles.btnRefund} onClick={() => refundMutation.mutate()} disabled={isAnyPending || !amount}>
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

      {activeError && <p style={styles.error}>{activeError.message}</p>}
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
  btnDelete: { padding: "0.2rem 0.5rem", background: "transparent", color: "#6b7280", border: "1px solid #374151", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem", lineHeight: 1 },
  waiting: { color: "#6b7280", fontStyle: "italic", marginTop: "0.5rem" },
  photos: { display: "flex", gap: "0.5rem", flexWrap: "wrap" as const, marginTop: "0.75rem" },
  thumbnail: { width: "80px", height: "80px", objectFit: "cover" as const, borderRadius: "4px", display: "block" },
  urlBox: { marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", background: "#1f2937", padding: "0.5rem", borderRadius: "4px", border: "1px solid #374151" },
  urlText: { fontSize: "0.8rem", wordBreak: "break-all", flex: 1, color: "#93c5fd" },
  error: { color: "#f87171", fontSize: "0.85rem", marginTop: "0.5rem" },
};
