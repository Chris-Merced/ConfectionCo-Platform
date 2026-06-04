import { useState, type ReactElement } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ── Shared types ───────────────────────────────────────────────────────────

interface Option { id: number; name: string; }
interface CrustOption { id: number; name: string; glutenFree: boolean; }
interface SizeOption { id: number; label: string; description: string; price: number; }
interface FixedProductOption { id: number; name: string; description: string | null; price: number; unitDescription: string | null; }

const FLAVOR_ITEM_TYPES = [
    { value: "CAKE",        label: "Cake" },
    { value: "PIE_CLASSIC", label: "Classic Pie" },
    { value: "PIE_CUSTARD", label: "Custard Pie" },
    { value: "CHEESECAKE",  label: "Cheesecake" },
    { value: "MACARON",     label: "Macaron" },
    { value: "SURPRISE_ME", label: "Surprise Me!" },
];

const SIZE_ITEM_TYPES = [
    { value: "PIE_CLASSIC", label: "Classic Pie" },
    { value: "PIE_CUSTARD", label: "Custard Pie" },
    { value: "CHEESECAKE",  label: "Cheesecake" },
    { value: "MACARON",     label: "Macaron" },
];

const PIE_TYPES = [
    { value: "CLASSIC", label: "Classic Pie" },
    { value: "CUSTARD", label: "Custard Pie" },
];

// -- General panel
interface CategoryPanelProps {
    label: string;
    fetchUrl: string;
    addUrl: string;
    deleteUrl: (id: number) => string;
    queryKey: string;
    token: string;
}

function CategoryPanel({ label, fetchUrl, addUrl, deleteUrl, queryKey, token }: CategoryPanelProps): ReactElement {
    const [newName, setNewName] = useState("");
    const queryClient = useQueryClient();

    const { data: options = [] } = useQuery<Option[]>({
        queryKey: [queryKey],
        queryFn: async () => {
            const res = await fetch(fetchUrl);
            if (!res.ok) throw new Error("Failed to load");
            return res.json();
        },
    });

    const addMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(addUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: newName.trim() }),
            });
            if (!res.ok) throw new Error("Failed to add");
            return res.json();
        },
        onSuccess: () => { setNewName(""); queryClient.invalidateQueries({ queryKey: [queryKey] }); },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(deleteUrl(id), { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Failed to delete");
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
    });

    return (
        <div className="options-panel">
            <h3 className="options-panel-title">{label}</h3>
            <ul className="options-list">
                {options.map(opt => (
                    <li key={opt.id} className="options-list-item">
                        <span>{opt.name}</span>
                        <button className="btn-icon" onClick={() => deleteMutation.mutate(opt.id)} disabled={deleteMutation.isPending}>✕</button>
                    </li>
                ))}
            </ul>
            <div className="options-add-row">
                <input className="form-input" type="text" placeholder={`Add ${label.toLowerCase()}…`}
                    value={newName} onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && newName.trim()) addMutation.mutate(); }}
                    maxLength={100} />
                <button className="btn-accept" onClick={() => addMutation.mutate()} disabled={!newName.trim() || addMutation.isPending}>Add</button>
            </div>
            {(addMutation.error || deleteMutation.error) && (
                <p className="order-card-error">{((addMutation.error || deleteMutation.error) as Error)?.message}</p>
            )}
        </div>
    );
}

// - - Flavor panel by Item Type

function FlavorPanel({ token }: { token: string }): ReactElement {
    const [selectedType, setSelectedType] = useState("CAKE");
    const [newName, setNewName] = useState("");
    const queryClient = useQueryClient();

    const { data: flavors = [] } = useQuery<Option[]>({
        queryKey: ["flavors", selectedType],
        queryFn: async () => {
            const res = await fetch(`/api/options/flavors?itemType=${selectedType}`);
            if (!res.ok) throw new Error("Failed to load");
            return res.json();
        },
    });

    const addMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/admin/options/flavors", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: newName.trim(), itemType: selectedType }),
            });
            if (!res.ok) throw new Error("Failed to add");
            return res.json();
        },
        onSuccess: () => { setNewName(""); queryClient.invalidateQueries({ queryKey: ["flavors", selectedType] }); },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/admin/options/flavors/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Failed to delete");
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flavors", selectedType] }),
    });

    return (
        <div className="options-panel">
            <h3 className="options-panel-title">Flavors</h3>
            <select className="options-select" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                {FLAVOR_ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ul className="options-list">
                {flavors.map(opt => (
                    <li key={opt.id} className="options-list-item">
                        <span>{opt.name}</span>
                        <button className="btn-icon" onClick={() => deleteMutation.mutate(opt.id)} disabled={deleteMutation.isPending}>✕</button>
                    </li>
                ))}
            </ul>
            <div className="options-add-row">
                <input className="form-input" type="text" placeholder="Add flavor…"
                    value={newName} onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && newName.trim()) addMutation.mutate(); }}
                    maxLength={100} />
                <button className="btn-accept" onClick={() => addMutation.mutate()} disabled={!newName.trim() || addMutation.isPending}>Add</button>
            </div>
            {(addMutation.error || deleteMutation.error) && (
                <p className="order-card-error">{((addMutation.error || deleteMutation.error) as Error)?.message}</p>
            )}
        </div>
    );
}

// ─- Pie Style panel Split by Pie Type

function PieStylePanel({ token }: { token: string }): ReactElement {
    const [selectedPieType, setSelectedPieType] = useState("CLASSIC");
    const [newName, setNewName] = useState("");
    const queryClient = useQueryClient();

    const { data: styles = [] } = useQuery<Option[]>({
        queryKey: ["pieStyles", selectedPieType],
        queryFn: async () => {
            const res = await fetch(`/api/options/pie-styles?pieType=${selectedPieType}`);
            if (!res.ok) throw new Error("Failed to load");
            return res.json();
        },
    });

    const addMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/admin/options/pie-styles", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: newName.trim(), pieType: selectedPieType }),
            });
            if (!res.ok) throw new Error("Failed to add");
            return res.json();
        },
        onSuccess: () => { setNewName(""); queryClient.invalidateQueries({ queryKey: ["pieStyles", selectedPieType] }); },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/admin/options/pie-styles/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Failed to delete");
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pieStyles", selectedPieType] }),
    });

    return (
        <div className="options-panel">
            <h3 className="options-panel-title">Pie Styles</h3>
            <select className="options-select" value={selectedPieType} onChange={e => setSelectedPieType(e.target.value)}>
                {PIE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ul className="options-list">
                {styles.map(opt => (
                    <li key={opt.id} className="options-list-item">
                        <span>{opt.name}</span>
                        <button className="btn-icon" onClick={() => deleteMutation.mutate(opt.id)} disabled={deleteMutation.isPending}>✕</button>
                    </li>
                ))}
            </ul>
            <div className="options-add-row">
                <input className="form-input" type="text" placeholder="Add style…"
                    value={newName} onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && newName.trim()) addMutation.mutate(); }}
                    maxLength={100} />
                <button className="btn-accept" onClick={() => addMutation.mutate()} disabled={!newName.trim() || addMutation.isPending}>Add</button>
            </div>
            {(addMutation.error || deleteMutation.error) && (
                <p className="order-card-error">{((addMutation.error || deleteMutation.error) as Error)?.message}</p>
            )}
        </div>
    );
}

// -- Cheesecake Crust panel
function CheesecakeCrustPanel({ token }: { token: string }): ReactElement {
    const [newName, setNewName] = useState("");
    const [newGlutenFree, setNewGlutenFree] = useState(false);
    const queryClient = useQueryClient();

    const { data: crusts = [] } = useQuery<CrustOption[]>({
        queryKey: ["cheesecakeCrusts"],
        queryFn: async () => {
            const res = await fetch("/api/options/cheesecake-crusts");
            if (!res.ok) throw new Error("Failed to load");
            return res.json();
        },
    });

    const addMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/admin/options/cheesecake-crusts", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: newName.trim(), glutenFree: newGlutenFree }),
            });
            if (!res.ok) throw new Error("Failed to add");
            return res.json();
        },
        onSuccess: () => { setNewName(""); setNewGlutenFree(false); queryClient.invalidateQueries({ queryKey: ["cheesecakeCrusts"] }); },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/admin/options/cheesecake-crusts/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Failed to delete");
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cheesecakeCrusts"] }),
    });

    return (
        <div className="options-panel">
            <h3 className="options-panel-title">Cheesecake Crusts</h3>
            <ul className="options-list">
                {crusts.map(opt => (
                    <li key={opt.id} className="options-list-item">
                        <span>{opt.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            {opt.glutenFree && <span className="options-gf-tag">GF</span>}
                            <button className="btn-icon" onClick={() => deleteMutation.mutate(opt.id)} disabled={deleteMutation.isPending}>✕</button>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="options-add-row">
                <input className="form-input" type="text" placeholder="Add crust…"
                    value={newName} onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && newName.trim()) addMutation.mutate(); }}
                    maxLength={100} />
                <button className="btn-accept" onClick={() => addMutation.mutate()} disabled={!newName.trim() || addMutation.isPending}>Add</button>
            </div>
            <label className="options-gf-checkbox">
                <input type="checkbox" checked={newGlutenFree} onChange={e => setNewGlutenFree(e.target.checked)} />
                Gluten Free
            </label>
            {(addMutation.error || deleteMutation.error) && (
                <p className="order-card-error">{((addMutation.error || deleteMutation.error) as Error)?.message}</p>
            )}
        </div>
    );
}

// -- Sizes panel

function SizePanel({ token }: { token: string }): ReactElement {
    const [selectedType, setSelectedType] = useState("CHEESECAKE");
    const [newLabel, setNewLabel] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const queryClient = useQueryClient();

    const { data: sizes = [] } = useQuery<SizeOption[]>({
        queryKey: ["sizes", selectedType],
        queryFn: async () => {
            const res = await fetch(`/api/options/sizes?itemType=${selectedType}`);
            if (!res.ok) throw new Error("Failed to load");
            return res.json();
        },
    });

    const addMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/admin/options/sizes", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ itemType: selectedType, label: newLabel.trim(), price: parseFloat(newPrice) || 0 }),
            });
            if (!res.ok) throw new Error("Failed to add");
            return res.json();
        },
        onSuccess: () => { setNewLabel(""); setNewPrice(""); queryClient.invalidateQueries({ queryKey: ["sizes", selectedType] }); },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/admin/options/sizes/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Failed to delete");
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sizes", selectedType] }),
    });

    return (
        <div className="options-panel">
            <h3 className="options-panel-title">Sizes</h3>
            <select className="options-select" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                {SIZE_ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ul className="options-list">
                {sizes.map(opt => (
                    <li key={opt.id} className="options-list-item">
                        <span>{opt.label}{opt.description ? ` — ${opt.description}` : ""}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span className="options-item-meta">${Number(opt.price).toFixed(2)}</span>
                            <button className="btn-icon" onClick={() => deleteMutation.mutate(opt.id)} disabled={deleteMutation.isPending}>✕</button>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="options-add-row">
                <input className="form-input" type="text" placeholder="Label (e.g. 6-inch)…"
                    value={newLabel} onChange={e => setNewLabel(e.target.value)} maxLength={50} />
                <input className="form-input" type="number" placeholder="Price" step="0.01" min="0"
                    value={newPrice} onChange={e => setNewPrice(e.target.value)}
                    style={{ width: "80px" }} />
                <button className="btn-accept" onClick={() => addMutation.mutate()} disabled={!newLabel.trim() || addMutation.isPending}>Add</button>
            </div>
            {(addMutation.error || deleteMutation.error) && (
                <p className="order-card-error">{((addMutation.error || deleteMutation.error) as Error)?.message}</p>
            )}
        </div>
    );
}

// -- Fixed Products panel

function FixedProductPanel({ token }: { token: string }): ReactElement {
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [newUnit, setNewUnit] = useState("");
    const queryClient = useQueryClient();

    const { data: products = [] } = useQuery<FixedProductOption[]>({
        queryKey: ["fixedProducts"],
        queryFn: async () => {
            const res = await fetch("/api/options/fixed-products");
            if (!res.ok) throw new Error("Failed to load");
            return res.json();
        },
    });

    const addMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/admin/options/fixed-products", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    name: newName.trim(),
                    description: newDescription.trim() || null,
                    price: parseFloat(newPrice) || 0,
                    unitDescription: newUnit.trim() || null,
                }),
            });
            if (!res.ok) throw new Error("Failed to add");
            return res.json();
        },
        onSuccess: () => {
            setNewName(""); setNewDescription(""); setNewPrice(""); setNewUnit("");
            queryClient.invalidateQueries({ queryKey: ["fixedProducts"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/admin/options/fixed-products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Failed to delete");
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fixedProducts"] }),
    });

    return (
        <div className="options-panel">
            <h3 className="options-panel-title">Fixed Products</h3>
            <ul className="options-list">
                {products.map(opt => (
                    <li key={opt.id} className="options-list-item">
                        <div>
                            <span>{opt.name}</span>
                            {opt.unitDescription && <span className="options-item-meta"> · {opt.unitDescription}</span>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span className="options-item-meta">${Number(opt.price).toFixed(2)}</span>
                            <button className="btn-icon" onClick={() => deleteMutation.mutate(opt.id)} disabled={deleteMutation.isPending}>✕</button>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="options-add-form">
                <input className="form-input" type="text" placeholder="Name…"
                    value={newName} onChange={e => setNewName(e.target.value)} maxLength={100} />
                <input className="form-input" type="text" placeholder="Unit (e.g. per loaf)…"
                    value={newUnit} onChange={e => setNewUnit(e.target.value)} maxLength={100} />
                <input className="form-input" type="number" placeholder="Price" step="0.01" min="0"
                    value={newPrice} onChange={e => setNewPrice(e.target.value)} />
                <input className="form-input" type="text" placeholder="Description (optional)…"
                    value={newDescription} onChange={e => setNewDescription(e.target.value)} maxLength={255} />
                <button className="btn-accept" onClick={() => addMutation.mutate()}
                    disabled={!newName.trim() || !newPrice || addMutation.isPending}>
                    Add Product
                </button>
            </div>
            {(addMutation.error || deleteMutation.error) && (
                <p className="order-card-error">{((addMutation.error || deleteMutation.error) as Error)?.message}</p>
            )}
        </div>
    );
}

// -- OptionsManager 

interface OptionsManagerProps {
    token: string;
}

export default function OptionsManager({ token }: OptionsManagerProps): ReactElement {
    const [open, setOpen] = useState(false);

    return (
        <div className="options-manager">
            <button className={`options-manager-toggle${open ? " is-open" : ""}`} onClick={() => setOpen(o => !o)}>
                <span className="options-manager-icon">⚙</span>
                Manage Options
                <span className="options-manager-chevron">▾</span>
            </button>
            {open && (
                <div className="options-manager-body">
                    <FlavorPanel token={token} />
                    <CategoryPanel
                        label="Fillings"
                        fetchUrl="/api/options/fillings"
                        addUrl="/api/admin/options/fillings"
                        deleteUrl={id => `/api/admin/options/fillings/${id}`}
                        queryKey="fillings"
                        token={token}
                    />
                    <CategoryPanel
                        label="Buttercream / Frosting"
                        fetchUrl="/api/options/buttercreams"
                        addUrl="/api/admin/options/buttercreams"
                        deleteUrl={id => `/api/admin/options/buttercreams/${id}`}
                        queryKey="buttercreams"
                        token={token}
                    />
                    <PieStylePanel token={token} />
                    <CheesecakeCrustPanel token={token} />
                    <SizePanel token={token} />
                    <FixedProductPanel token={token} />
                </div>
            )}
        </div>
    );
}
