import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactElement } from "react";

import OrderCard, { type Order } from "../components/orderCard";

const STATUS_SECTIONS: { key: string; label: string }[] = [
    { key: "PENDING", label: "Pending Review" },
    { key: "AWAITING_DEPOSIT", label: "Awaiting Deposit" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "AWAITING_FINAL_PAYMENT", label: "Awaiting Final Payment" },
    { key: "PAID_IN_FULL", label: "Paid in Full" },
    { key: "REFUNDED", label: "Refunded" },
    { key: "REJECTED", label: "Rejected" },
];


//TODO:
// add region locking to orders
// add date to order
// hodges bayou plantation
// beige/brown base, pink accent, black lettering
// make sure failure events are communicated to the front end like order not going through etc 
// see if we can set up an inbox for emails to come in for support in case wrong phone number
 
export default function AdminDashboard(): ReactElement {
    const { isLoading, isAuthenticated, error, loginWithRedirect: login, logout: auth0Logout, user, getAccessTokenSilently } = useAuth0();

    const [token, setToken] = useState("");

    useEffect(() => {
        if (!isAuthenticated) return;
        getAccessTokenSilently({ authorizationParams: { audience: "https://confectionco-api" } })
            .then(setToken);
    }, [isAuthenticated]);

    const { data: orders, isLoading: ordersLoading, error: ordersError, refetch } = useQuery<Order[]>({
        queryKey: ["orders"],
        queryFn: async () => {
            const res = await fetch("http://localhost:8080/api/admin/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to retrieve orders");
            return res.json();
        },
        enabled: isAuthenticated && !!token,
    });

    const handleLogin = () => login({ appState: { returnTo: "/admin" } });
    const logout = () => auth0Logout({ logoutParams: { returnTo: window.location.origin } });

    if (isLoading) return <p>Loading...</p>;

    if (!isAuthenticated) {
        return (
            <div style={styles.centered}>
                {error && <p style={styles.error}>Error: {error.message}</p>}
                <button style={styles.btn} onClick={handleLogin}>Admin Login</button>
            </div>
        );
    }

    const grouped = STATUS_SECTIONS.reduce<Record<string, Order[]>>((acc, { key }) => {
        acc[key] = (orders ?? []).filter((o) => o.status === key);
        return acc;
    }, {});

    return (
        <div style={styles.page}>
            <div style={styles.topBar}>
                <h1 style={styles.heading}>Order Dashboard</h1>
                <div>
                    <span style={styles.userEmail}>{user?.email}</span>
                    <button style={styles.logoutBtn} onClick={logout}>Logout</button>
                </div>
            </div>

            {ordersLoading && <p>Loading orders...</p>}
            {ordersError && <p style={styles.error}>Failed to load orders.</p>}

            {!ordersLoading && orders && (
                <div style={styles.board}>
                    {STATUS_SECTIONS.map(({ key, label }) =>
                        grouped[key].length === 0 ? null : (
                            <div key={key} style={styles.column}>
                                <h2 style={styles.columnHeader}>
                                    {label}
                                    <span style={styles.badge}>{grouped[key].length}</span>
                                </h2>
                                {grouped[key].map((order) => (
                                    <OrderCard key={order.id} order={order} token={token} onUpdate={refetch} />
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: { padding: "1.5rem", fontFamily: "sans-serif", background: "#111827", minHeight: "100vh", color: "#f3f4f6", boxSizing: "border-box", width: "100%" },
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" },
    heading: { margin: 0, color: "#f9fafb" },
    userEmail: { marginRight: "1rem", fontSize: "0.9rem", color: "#9ca3af" },
    logoutBtn: { padding: "0.4rem 0.8rem", background: "#374151", color: "#f3f4f6", border: "none", borderRadius: "4px", cursor: "pointer" },
    board: { display: "flex", flexDirection: "column", gap: "2rem" },
    column: { background: "#1f2937", borderRadius: "8px", padding: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" },
    columnHeader: { margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", color: "#e5e7eb" },
    badge: { background: "#374151", color: "#9ca3af", borderRadius: "12px", padding: "0.1rem 0.5rem", fontSize: "0.8rem", fontWeight: 400 },
    centered: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#111827" },
    btn: { padding: "0.6rem 1.2rem", background: "#374151", color: "#f3f4f6", border: "none", borderRadius: "4px", cursor: "pointer" },
    error: { color: "#f87171" },
};
