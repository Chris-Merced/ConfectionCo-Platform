import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactElement } from "react";

import OrderCard, { type Order } from "../components/orderCard";

const STATUS_SECTIONS: { key: string; label: string; collapsible?: boolean }[] = [
    { key: "PENDING", label: "Pending Review" },
    { key: "AWAITING_DEPOSIT", label: "Awaiting Deposit" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "AWAITING_FINAL_PAYMENT", label: "Awaiting Final Payment" },
    { key: "PAID_IN_FULL", label: "Paid in Full" },
    { key: "REFUND_PENDING", label: "Refund Pending" },
    { key: "REFUNDED", label: "Refunded", collapsible: true },
    { key: "REJECTED", label: "Rejected" },
];
//TODO: Remember to Verify the Application in the Google OAuth Cloud Dashboard when Live
// When production ready; Set the completed button to send a text with a link referring
//     the customer to a google/facebook review link
// Add favicon with company logo
// Add SEO optimizations if necessary
// Implement sms_consent change to false on STOP or UNSUBSCRIBE message
// Implement HELP message for sms
export default function AdminDashboard(): ReactElement {
    const { isLoading, isAuthenticated, error, loginWithRedirect: login, logout: auth0Logout, user, getAccessTokenSilently } = useAuth0();

    const [token, setToken] = useState("");
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set(["REFUNDED"]));

    useEffect(() => {
        if (!isAuthenticated) return;
        getAccessTokenSilently({ authorizationParams: { audience: "https://confectionco-api" } })
            .then(setToken);
    }, [isAuthenticated]);

    const { data: orders, isLoading: ordersLoading, error: ordersError, refetch } = useQuery<Order[]>({
        queryKey: ["orders"],
        queryFn: async () => {
            const res = await fetch("/api/admin/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to retrieve orders");
            return res.json();
        },
        enabled: isAuthenticated && !!token,
    });

    const handleLogin = () => login({ appState: { returnTo: "/admin" } });
    const logout = () => auth0Logout({ logoutParams: { returnTo: window.location.origin } });

    if (isLoading) return <div className="admin-login-page"><p className="admin-status-msg">Loading...</p></div>;

    if (!isAuthenticated) {
        return (
            <div className="admin-login-page">
                {error && <p className="admin-error">Error: {error.message}</p>}
                <p className="admin-login-title">Confection Co — Admin</p>
                <button className="admin-login-btn" onClick={handleLogin}>Admin Login</button>
            </div>
        );
    }

    const grouped = STATUS_SECTIONS.reduce<Record<string, Order[]>>((acc, { key }) => {
        acc[key] = (orders ?? []).filter((o) => o.status === key);
        return acc;
    }, {});

    return (
        <div className="admin-page">
            <div className="admin-topbar">
                <span className="admin-topbar-brand">Confection <span>Co</span> — Orders</span>
                <div className="admin-topbar-right">
                    <span className="admin-user-email">{user?.email}</span>
                    <button className="admin-logout-btn" onClick={logout}>Logout</button>
                </div>
            </div>

            <div className="admin-body">
                {ordersLoading && <p className="admin-status-msg">Loading orders...</p>}
                {ordersError && <p className="admin-error">Failed to load orders.</p>}

                {!ordersLoading && orders && (
                    <>
                        <div className="admin-section-nav">
                            {STATUS_SECTIONS.filter(({ key }) => grouped[key].length > 0).map(({ key, label }) => (
                                <button
                                    key={key}
                                    className="admin-section-nav-btn"
                                    onClick={() => document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: "smooth" })}
                                >
                                    {label}
                                    <span className="admin-badge">{grouped[key].length}</span>
                                </button>
                            ))}
                        </div>
                        <div className="admin-board">
                            {STATUS_SECTIONS.map(({ key, label, collapsible }) =>
                                grouped[key].length === 0 ? null : (
                                    <div key={key} id={`section-${key}`} className="admin-column">
                                        <h2 className="admin-column-header">
                                            {label}
                                            <span className="admin-badge">{grouped[key].length}</span>
                                            {collapsible && (
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => setCollapsed(prev => {
                                                        const next = new Set(prev);
                                                        next.has(key) ? next.delete(key) : next.add(key);
                                                        return next;
                                                    })}
                                                >
                                                    {collapsed.has(key) ? "▸" : "▾"}
                                                </button>
                                            )}
                                        </h2>
                                        {!collapsed.has(key) && grouped[key].map((order) => (
                                            <OrderCard key={order.id} order={order} token={token} onUpdate={refetch} />
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
