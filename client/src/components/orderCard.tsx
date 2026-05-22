import { useState, type ReactElement } from "react";
import { useMutation } from "@tanstack/react-query";

export interface Order {
  id: number;
  customerName: string | null;
  email: string;
  phoneNumber: string;
  status: string;
  depositAmount: number | null;
  finalPaymentAmount: number | null;
  depositPaid: boolean;
  fullPaymentPaid: boolean;
  servingCount: number;
  comments: string | null;
  fulfillmentType: string;
  deliveryAddress: string | null;
  fulfillmentDate: string | null;
  createdAt: string;
  smsConsent: boolean;
  paymentLinkToken: string | null;
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
    const res = await fetch(path, {
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
    mutationFn: () => post(`/api/admin/orders/${order.id}/deposit-link`, { depositAmount: parseFloat(amount) }),
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

  const showPaymentLink = () => {
    if (order.paymentLinkToken) setPaymentUrl(`${window.location.origin}/pay/${order.paymentLinkToken}`);
  };

  const commentsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/orders/${order.id}/comments`, {
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
      const res = await fetch(`/api/admin/orders/${order.id}`, {
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

  const isUrgent = order.fulfillmentDate
    ? (new Date(order.fulfillmentDate + "T00:00:00Z").getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24) < 7
    : false;

  const isAnyPending =
    rejectMutation.isPending ||
    depositLinkMutation.isPending ||
    finalLinkMutation.isPending ||
    completeMutation.isPending ||
    refundMutation.isPending ||
    commentsMutation.isPending ||
    deleteMutation.isPending;

  const activeError = (
    rejectMutation.error ||
    depositLinkMutation.error ||
    finalLinkMutation.error ||
    completeMutation.error ||
    refundMutation.error ||
    commentsMutation.error ||
    deleteMutation.error
  ) as Error | null;

  return (
    <div className="order-card">
      <div className="order-card-row">
        <strong className="order-card-id">Order #{order.id}</strong>
        <div className="order-card-meta">
          <span className="order-card-date">{new Date(order.createdAt).toLocaleDateString()}</span>
          <button className="btn-icon" onClick={handleDelete} disabled={isAnyPending} title="Remove order">✕</button>
        </div>
      </div>

      {order.status !== "COMPLETED" && order.status !== "REFUNDED" && (
        <p className={`sms-status ${order.smsConsent ? "sms-status--automatic" : "sms-status--manual"}`}>
          {order.smsConsent ? "Automatic" : "Not Automatic"}
        </p>
      )}

      {order.customerName && (
        <p className="order-card-field"><strong>Name:</strong> {order.customerName}</p>
      )}
      <p className="order-card-field"><strong>Email:</strong> {order.email}</p>
      <p className="order-card-field"><strong>Phone:</strong> {order.phoneNumber}</p>
      <p className="order-card-field"><strong>Servings:</strong> {order.servingCount}</p>
      <p className="order-card-field">
        <strong>Fulfillment:</strong> {order.fulfillmentType === "DROPOFF" ? "Delivery" : "Pickup"}
      </p>
      {order.deliveryAddress && (
        <p className="order-card-field">
          <strong>Delivery Address:</strong>{" "}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`}
            target="_blank"
            rel="noreferrer"
          >
            {order.deliveryAddress}
          </a>
        </p>
      )}
      {order.fulfillmentDate && (
        <p className="order-card-field">
          <strong>{order.fulfillmentType === "DROPOFF" ? "Delivery Date" : "Pickup Date"}:</strong>{" "}
          {new Date(order.fulfillmentDate + "T00:00:00").toLocaleDateString()}
        </p>
      )}
      {order.depositAmount != null && (
        <p className="order-card-field"><strong>Deposit:</strong> ${order.depositAmount.toFixed(2)}</p>
      )}

      <div style={{ margin: "0.2rem 0" }}>
        {editingComments ? (
          <div className="order-card-comments-edit">
            <textarea
              className="order-card-textarea"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
            <div className="order-card-comments-actions">
              <button className="btn-accept" onClick={() => commentsMutation.mutate()} disabled={isAnyPending}>Save</button>
              <button className="btn-reject" onClick={() => { setComments(order.comments ?? ""); setEditingComments(false); }} disabled={isAnyPending}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="order-card-comments-view">
            <div className="order-card-comments-text">
              <span className="order-card-comments-label">Comments:</span>
              <p className="order-card-comments-body">
                {comments || <em className="order-card-comments-none">none</em>}
              </p>
            </div>
            <button className="btn-icon" onClick={() => setEditingComments(true)}>Edit</button>
          </div>
        )}
      </div>

      {order.photoUrls.length > 0 && order.status !== "REFUNDED" && (
        <div className="order-card-photos">
          {order.photoUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer">
              <img src={url} alt={`Inspiration ${i + 1}`} className="order-card-thumbnail" />
            </a>
          ))}
        </div>
      )}

      {order.status === "PENDING" && (
        <div className="order-card-actions">
          <input
            className="order-card-input"
            type="number"
            placeholder={isUrgent ? "Full payment amount" : "Deposit amount"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
          />
          <button
            className="btn-accept"
            onClick={() => isUrgent ? finalLinkMutation.mutate() : depositLinkMutation.mutate()}
            disabled={isAnyPending || !amount}
          >
            {isUrgent ? "Accept — Full Payment" : "Accept"}
          </button>
          <button className="btn-reject" onClick={() => rejectMutation.mutate()} disabled={isAnyPending}>
            Reject
          </button>
        </div>
      )}

      {order.status === "AWAITING_DEPOSIT" && (
        <div className="order-card-actions">
          <p className="order-card-waiting">Waiting for customer to pay deposit.</p>
          <button className="btn-copy" onClick={showPaymentLink} disabled={!order.paymentLinkToken}>
            Show Link
          </button>
        </div>
      )}

      {order.status === "IN_PROGRESS" && (
        <div className="order-card-actions">
          <input
            className="order-card-input"
            type="number"
            placeholder="Final payment amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
          />
          <button className="btn-accept" onClick={() => finalLinkMutation.mutate()} disabled={isAnyPending || !amount}>
            Send Final Payment Link
          </button>
        </div>
      )}

      {order.status === "AWAITING_FINAL_PAYMENT" && (
        <div className="order-card-actions">
          <p className="order-card-waiting">Waiting for customer to pay final balance.</p>
          <button className="btn-copy" onClick={showPaymentLink} disabled={!order.paymentLinkToken}>
            Show Link
          </button>
        </div>
      )}

      {order.status === "PAID_IN_FULL" && (
        <div className="order-card-actions">
          <button className="btn-accept" onClick={() => completeMutation.mutate()} disabled={isAnyPending}>
            Mark as Complete
          </button>
        </div>
      )}


      {order.status === "REFUND_PENDING" && (
        <div className="order-card-refund-section">
          <p className="order-card-waiting">Refund submitted — awaiting Stripe confirmation.</p>
          {order.finalPaymentAmount != null && (
            <span className="order-card-refund-label">
              Final payment: ${order.finalPaymentAmount.toFixed(2)}
            </span>
          )}
          <input
            className="order-card-input"
            type="number"
            placeholder="Retry refund amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
          />
          <button className="btn-refund" onClick={() => refundMutation.mutate()} disabled={isAnyPending || !amount}>
            Retry Refund
          </button>
        </div>
      )}

      {order.status === "PAID_IN_FULL" && (
        <div className="order-card-refund-section">
          {order.finalPaymentAmount != null && (
            <span className="order-card-refund-label">
              Final payment: ${order.finalPaymentAmount.toFixed(2)}
            </span>
          )}
          <input
            className="order-card-input"
            type="number"
            placeholder="Refund amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
          />
          <button className="btn-refund" onClick={() => refundMutation.mutate()} disabled={isAnyPending || !amount}>
            Issue Refund
          </button>
        </div>
      )}

      {paymentUrl && (
        <div className="order-card-url-box">
          <span className="order-card-url-text">{paymentUrl}</span>
          <button className="btn-copy" onClick={() => navigator.clipboard.writeText(paymentUrl)}>
            Copy Link
          </button>
        </div>
      )}

      {activeError && <p className="order-card-error">{activeError.message}</p>}
    </div>
  );
}
