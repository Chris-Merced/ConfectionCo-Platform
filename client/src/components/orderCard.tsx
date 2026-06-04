import { useState, useMemo, type ReactElement } from "react";
import { useMutation } from "@tanstack/react-query";
import { parseApiError } from "../utils/parseApiError";

const ITEM_TYPE_LABELS: Record<string, string> = {
  CAKE: "Custom Cake",
  PIE_CLASSIC: "Classic Pie",
  PIE_CUSTARD: "Custard Pie",
  CHEESECAKE: "Cheesecake",
  MACARON: "Macarons",
  SURPRISE_ME: "Surprise Me!",
};

interface OrderCustomItem {
  id: number;
  itemType: string;
  sizeLabel: string | null;
  sizePrice: number | null;
  quantity: number;
  flavorName: string | null;
  flavor2Name: string | null;
  fillingName: string | null;
  buttercreamName: string | null;
  colorPreference: string | null;
  pieStyleName: string | null;
  glutenFree: boolean;
  cheesecakeCrustName: string | null;
  comments: string | null;
  photoUrls: string[];
}

interface OrderFixedItem {
  id: number;
  productName: string;
  description: string | null;
  unitDescription: string | null;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  customerName: string | null;
  email: string;
  phoneNumber: string;
  status: string;
  totalAmount: number | null;
  depositAmount: number | null;
  finalPaymentAmount: number | null;
  depositPaid: boolean;
  fullPaymentPaid: boolean;
  comments: string | null;
  fulfillmentType: string;
  deliveryAddress: string | null;
  fulfillmentDate: string | null;
  createdAt: string;
  smsConsent: boolean;
  paymentLinkToken: string | null;
  photoUrls: string[];
  customItems: OrderCustomItem[];
  fixedItems: OrderFixedItem[];
}

interface OrderCardProps {
  order: Order;
  token: string;
  onUpdate: () => void;
}

export default function OrderCard({ order, token, onUpdate }: OrderCardProps): ReactElement {
  const [amount, setAmount] = useState("");
  const [cakePrices, setCakePrices] = useState<Record<number, string>>({});
  const [editingComments, setEditingComments] = useState(false);

  const calculatedTotal = useMemo(() => {
    const itemsTotal = order.customItems.reduce((s, i) => s + (i.sizePrice != null ? Number(i.sizePrice) * i.quantity : 0), 0);
    const fixedTotal  = order.fixedItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    return itemsTotal + fixedTotal;
  }, [order.customItems, order.fixedItems]);
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
    if (!res.ok) throw await parseApiError(res);
    return res.json();
  };

  const rejectMutation = useMutation({
    mutationFn: () => post(`/api/admin/orders/${order.id}/reject`),
    onSuccess: onUpdate,
  });

  const depositLinkMutation = useMutation({
    mutationFn: (total: number) => post(`/api/admin/orders/${order.id}/deposit-link`, { totalAmount: total }),
    onSuccess: (data) => { setPaymentUrl(data.url); setAmount(""); onUpdate(); },
  });

  const finalLinkMutation = useMutation({
    mutationFn: (amt: number) => post(`/api/admin/orders/${order.id}/final-link`, { amount: amt }),
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

  const advanceMutation = useMutation({
    mutationFn: (amount?: number) => post(`/api/admin/orders/${order.id}/advance`, amount != null ? { amount } : undefined),
    onSuccess: () => { setPaymentUrl(null); onUpdate(); },
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
      if (!res.ok) throw await parseApiError(res);
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
      if (!res.ok) throw await parseApiError(res);
    },
    onSuccess: onUpdate,
  });

  const handleDelete = () => {
    if (!window.confirm(`Remove order #${order.id}? This cannot be undone.`)) return;
    deleteMutation.mutate();
  };

  const handleAdvance = (message: string, amount?: number) => {
    if (!window.confirm(message)) return;
    advanceMutation.mutate(amount);
  };

  const photosDeleted = ["REJECTED", "REFUNDED", "COMPLETED", "REMOVED"].includes(order.status);

  const remainingBalance =
    order.totalAmount != null && order.depositAmount != null
      ? (order.totalAmount - order.depositAmount).toFixed(2)
      : null;

  const isUrgent = order.fulfillmentDate
    ? (new Date(order.fulfillmentDate + "T00:00:00Z").getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24) < 7
    : false;

  const isAnyPending =
    rejectMutation.isPending ||
    depositLinkMutation.isPending ||
    finalLinkMutation.isPending ||
    completeMutation.isPending ||
    refundMutation.isPending ||
    advanceMutation.isPending ||
    commentsMutation.isPending ||
    deleteMutation.isPending;

  const activeError = (
    rejectMutation.error ||
    depositLinkMutation.error ||
    finalLinkMutation.error ||
    completeMutation.error ||
    refundMutation.error ||
    advanceMutation.error ||
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

      {(order.customItems.length > 0 || order.fixedItems.length > 0) && (
        <div className="order-card-items">
          {order.customItems.map(item => (
            <div key={item.id} className="order-card-item">
              <div className="order-card-item-header">
                <span className="order-card-item-type">{ITEM_TYPE_LABELS[item.itemType] ?? item.itemType}</span>
                {item.sizeLabel && (
                  <span className="order-card-item-size">
                    {item.sizeLabel}{item.sizePrice != null ? ` · $${Number(item.sizePrice).toFixed(2)}` : ""}
                  </span>
                )}
                {item.quantity > 1 && <span className="order-card-item-qty">×{item.quantity}</span>}
              </div>
              <div className="order-card-item-details">
                {item.flavorName && <span>{item.flavorName}</span>}
                {item.flavor2Name && <span>{item.flavor2Name}</span>}
                {item.fillingName && <span>Filling: {item.fillingName}</span>}
                {item.buttercreamName && <span>Frosting: {item.buttercreamName}</span>}
                {item.pieStyleName && <span>Style: {item.pieStyleName}</span>}
                {item.cheesecakeCrustName && (
                  <span>Crust: {item.cheesecakeCrustName}{item.glutenFree ? " (GF)" : ""}</span>
                )}
                {!item.cheesecakeCrustName && item.glutenFree && <span>Gluten Free</span>}
                {item.colorPreference && <span>Color: {item.colorPreference}</span>}
                {item.comments && <span style={{ fontStyle: "italic" }}>Notes: {item.comments}</span>}
              </div>
              {item.photoUrls.length > 0 && !photosDeleted && (
                <div className="order-card-photos">
                  {item.photoUrls.map((url, j) => (
                    <a key={j} href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt={`Inspiration ${j + 1}`} className="order-card-thumbnail" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {order.fixedItems.length > 0 && (
            <div className="order-card-fixed-items">
              {order.fixedItems.map(item => (
                <p key={item.id} className="order-card-field">
                  <strong>{item.productName}</strong> ×{item.quantity}
                  {item.unitDescription && <span className="order-card-unit"> ({item.unitDescription})</span>}
                  {" · "}<span className="order-card-unit">${Number(item.price).toFixed(2)}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}

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
      {order.totalAmount != null ? (
        <p className="order-card-field"><strong>Order Total:</strong> ${order.totalAmount.toFixed(2)}</p>
      ) : calculatedTotal > 0 && (
        <p className="order-card-field"><strong>Items Total:</strong> ${calculatedTotal.toFixed(2)}{order.customItems.some(i => i.itemType === "CAKE") ? " (+ cake TBD)" : ""}</p>
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

      {order.photoUrls.length > 0 && !photosDeleted && (
        <div className="order-card-photos">
          {order.photoUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer">
              <img src={url} alt={`Inspiration ${i + 1}`} className="order-card-thumbnail" />
            </a>
          ))}
        </div>
      )}

      {order.status === "PENDING" && (() => {
        const cakeItems = order.customItems.filter(i => i.itemType === "CAKE");
        const cakeTotal = cakeItems.reduce((s, i) => s + (parseFloat(cakePrices[i.id] ?? "") || 0), 0);
        const grandTotal = calculatedTotal + cakeTotal;
        const depositDisplay = grandTotal * 0.4;
        const allCakesFilled = cakeItems.every(i => parseFloat(cakePrices[i.id] ?? "") > 0);
        const canAccept = grandTotal > 0 && (cakeItems.length === 0 || allCakesFilled);
        return (
          <div className="order-card-actions">
            {cakeItems.length > 0 && (
              <div className="order-card-cake-prices">
                {cakeItems.map((cake, idx) => (
                  <div key={cake.id} className="order-card-cake-price-row">
                    <label className="order-card-cake-price-label">
                      {cakeItems.length > 1 ? `Cake #${idx + 1}` : "Cake"} Price
                      {cake.colorPreference ? ` (${cake.colorPreference})` : ""}
                    </label>
                    <div className="order-card-cake-price-wrap">
                      <span className="order-card-cake-price-symbol">$</span>
                      <input
                        className="order-card-input"
                        type="number"
                        placeholder="0.00"
                        value={cakePrices[cake.id] ?? ""}
                        onChange={(e) => setCakePrices(prev => ({ ...prev, [cake.id]: e.target.value }))}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="order-card-deposit-summary">
              <div className="order-card-deposit-row">
                <span>Order Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
              <div className="order-card-deposit-row order-card-deposit-row--highlight">
                <span>40% Deposit</span>
                <span>${depositDisplay.toFixed(2)}</span>
              </div>
            </div>
            <button
              className="btn-accept"
              onClick={() => isUrgent ? finalLinkMutation.mutate(grandTotal) : depositLinkMutation.mutate(grandTotal)}
              disabled={isAnyPending || !canAccept}
            >
              {isUrgent ? "Accept — Full Payment" : "Accept"}
            </button>
            <button className="btn-accept" onClick={() => handleAdvance("Mark deposit as received? This will advance the order and cannot be undone.", grandTotal > 0 ? grandTotal : undefined)} disabled={isAnyPending}>
              Mark Deposit Received
            </button>
            <button className="btn-reject" onClick={() => { if (!window.confirm("Reject this order? The customer will be notified.")) return; rejectMutation.mutate(); }} disabled={isAnyPending}>
              Reject
            </button>
          </div>
        );
      })()}

      {order.status === "AWAITING_DEPOSIT" && (
        <div className="order-card-actions">
          <p className="order-card-waiting">Waiting for customer to pay deposit.</p>
          <button className="btn-copy" onClick={showPaymentLink} disabled={!order.paymentLinkToken}>
            Show Link
          </button>
          <input
            className="order-card-input"
            type="number"
            placeholder="New order total"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
          />
          <button className="btn-accept" onClick={() => depositLinkMutation.mutate(parseFloat(amount))} disabled={isAnyPending || !amount}>
            Regenerate Link
          </button>
          <button className="btn-accept" onClick={() => handleAdvance("Mark deposit as received? This will advance the order and cannot be undone.")} disabled={isAnyPending}>
            Mark Deposit Received
          </button>
        </div>
      )}

      {order.status === "IN_PROGRESS" && (
        <div className="order-card-actions">
          <input
            className="order-card-input"
            type="number"
            placeholder={remainingBalance ?? "Final payment amount"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
          />
          <button className="btn-accept" onClick={() => finalLinkMutation.mutate(parseFloat(amount))} disabled={isAnyPending || !amount}>
            Send Final Payment Link
          </button>
          <button className="btn-accept" onClick={() => handleAdvance("Mark payment as received? This will advance the order and cannot be undone.", amount ? parseFloat(amount) : undefined)} disabled={isAnyPending}>
            Mark Payment Received
          </button>
        </div>
      )}

      {order.status === "AWAITING_FINAL_PAYMENT" && (
        <div className="order-card-actions">
          <p className="order-card-waiting">Waiting for customer to pay final balance.</p>
          <button className="btn-copy" onClick={showPaymentLink} disabled={!order.paymentLinkToken}>
            Show Link
          </button>
          <input
            className="order-card-input"
            type="number"
            placeholder={remainingBalance ?? "New final payment amount"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
          />
          <button className="btn-accept" onClick={() => finalLinkMutation.mutate(parseFloat(amount))} disabled={isAnyPending || !amount}>
            Regenerate Link
          </button>
          <button className="btn-accept" onClick={() => handleAdvance("Mark payment as received? This will advance the order and cannot be undone.")} disabled={isAnyPending}>
            Mark Payment Received
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
