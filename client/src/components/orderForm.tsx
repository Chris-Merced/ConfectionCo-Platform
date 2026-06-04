import { useState, type FormEvent, type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";

// ── Types ──────────────────────────────────────────────────────────────────

type ItemType = "CAKE" | "PIE_CLASSIC" | "PIE_CUSTARD" | "CHEESECAKE" | "MACARON" | "SURPRISE_ME";

interface Option      { id: number; name: string; }
interface CrustOption { id: number; name: string; glutenFree: boolean; }
interface SizeOption  { id: number; label: string; description: string; price: number; }
interface FixedProduct { id: number; name: string; description: string; price: number; unitDescription: string; }

interface CartItem {
    itemType:           ItemType;
    quantity:           number;
    sizeId:             number | null;
    sizeLabel:          string;
    flavorId:           number | null;
    flavorName:         string;
    flavor2Id:          number | null;
    flavor2Name:        string;
    fillingId:          number | null;
    fillingName:        string;
    buttercreamId:      number | null;
    buttercreamName:    string;
    colorPreference:    string;
    pieStyleId:         number | null;
    pieStyleName:       string;
    glutenFree:         boolean;
    cheesecakeCrustId:  number | null;
    cheesecakeCrustName: string;
    comments:           string;
    photos:             File[];
}

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
    CAKE:        "Custom Cake",
    PIE_CLASSIC: "Classic Pie",
    PIE_CUSTARD: "Custard Pie",
    CHEESECAKE:  "Cheesecake",
    MACARON:     "Macarons",
    SURPRISE_ME: "Surprise Me!",
};

const BLANK_ITEM: CartItem = {
    itemType: "CAKE", quantity: 1,
    sizeId: null, sizeLabel: "",
    flavorId: null, flavorName: "",
    flavor2Id: null, flavor2Name: "",
    fillingId: null, fillingName: "",
    buttercreamId: null, buttercreamName: "",
    colorPreference: "",
    pieStyleId: null, pieStyleName: "",
    glutenFree: false,
    cheesecakeCrustId: null, cheesecakeCrustName: "",
    comments: "",
    photos: [],
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE  = 10 * 1024 * 1024;

// ── ItemBuilder ────────────────────────────────────────────────────────────

interface ItemBuilderProps {
    cakeFlavors:       Option[];
    classicPieFlavors: Option[];
    custardPieFlavors: Option[];
    cheesecakeFlavors: Option[];
    macaronFlavors:    Option[];
    fillings:          Option[];
    buttercreams:      Option[];
    classicPieStyles:  Option[];
    custardPieStyles:  Option[];
    cheesecakeCrusts:  CrustOption[];
    cheesecakeSizes:   SizeOption[];
    classicPieSizes:   SizeOption[];
    custardPieSizes:   SizeOption[];
    macaronSizes:      SizeOption[];
    onAdd:    (item: CartItem) => void;
    onCancel: () => void;
}

function ItemBuilder({
    cakeFlavors, classicPieFlavors, custardPieFlavors,
    cheesecakeFlavors, macaronFlavors,
    fillings, buttercreams, classicPieStyles, custardPieStyles,
    cheesecakeCrusts, cheesecakeSizes,
    classicPieSizes, custardPieSizes, macaronSizes,
    onAdd, onCancel,
}: ItemBuilderProps): ReactElement {
    const [item, setItem] = useState<CartItem>({ ...BLANK_ITEM });
    const [photoError, setPhotoError] = useState("");

    const set = <K extends keyof CartItem>(key: K, value: CartItem[K]) =>
        setItem(prev => ({ ...prev, [key]: value }));

    const setType = (type: ItemType) => {
        const base = { ...BLANK_ITEM, itemType: type };
        if (type === "PIE_CLASSIC" && classicPieSizes.length > 0) { base.sizeId = classicPieSizes[0].id; base.sizeLabel = classicPieSizes[0].label; }
        if (type === "PIE_CUSTARD" && custardPieSizes.length > 0) { base.sizeId = custardPieSizes[0].id; base.sizeLabel = custardPieSizes[0].label; }
        if (type === "MACARON"    && macaronSizes.length > 0)      { base.sizeId = macaronSizes[0].id;    base.sizeLabel = macaronSizes[0].label; }
        setItem(base);
    };

    const pickFlavor = (options: Option[], id: number, field: "flavorId" | "flavor2Id", nameField: "flavorName" | "flavor2Name") => {
        const opt = options.find(o => o.id === id);
        setItem(prev => ({ ...prev, [field]: id || null, [nameField]: opt?.name ?? "" }));
    };

    const pickOption = <K extends keyof CartItem, L extends keyof CartItem>(
        options: Option[], id: number, idField: K, nameField: L
    ) => {
        const opt = options.find(o => o.id === id);
        setItem(prev => ({ ...prev, [idField]: id || null as any, [nameField]: opt?.name ?? "" as any }));
    };

    const pickSize = (options: SizeOption[], id: number) => {
        const opt = options.find(o => o.id === id);
        setItem(prev => ({ ...prev, sizeId: id || null, sizeLabel: opt?.label ?? "" }));
    };

    const pickCrust = (id: number) => {
        const opt = cheesecakeCrusts.find(o => o.id === id);
        setItem(prev => ({ ...prev, cheesecakeCrustId: id || null, cheesecakeCrustName: opt?.name ?? "" }));
    };

    function handlePhotos(files: FileList | null) {
        setPhotoError("");
        if (!files) return;
        for (const f of Array.from(files)) {
            if (!ALLOWED_TYPES.includes(f.type)) { setPhotoError("Only JPEG, PNG, and WebP images are allowed."); return; }
            if (f.size > MAX_FILE_SIZE)           { setPhotoError(`"${f.name}" exceeds the 10MB limit.`); return; }
        }
        set("photos", Array.from(files));
    }

    function validate(): string {
        const t = item.itemType;
        if (t === "CAKE")                         { if (!item.flavorId) return "Cake requires a flavor."; if (!item.buttercreamId) return "Cake requires a buttercream / frosting."; }
        if (t === "SURPRISE_ME")                  { if (!item.flavorId) return "Surprise Me requires a flavor."; }
        if (t === "PIE_CLASSIC" || t === "PIE_CUSTARD") { if (!item.sizeId) return "Pie size unavailable — please try again."; if (!item.flavorId) return "Pie requires a flavor."; if (!item.pieStyleId) return "Pie requires a style."; }
        if (t === "CHEESECAKE")                   { if (!item.sizeId) return "Cheesecake requires a size."; if (!item.flavorId) return "Cheesecake requires a flavor."; if (!item.cheesecakeCrustId) return "Cheesecake requires a crust."; }
        if (t === "MACARON")                      { if (!item.sizeId) return "Macaron size unavailable — please try again."; if (!item.flavorId) return "Macarons require the first flavor."; if (!item.flavor2Id) return "Macarons require the second flavor."; }
        return "";
    }

    function handleAdd() {
        const err = validate();
        if (err) { setPhotoError(err); return; }
        onAdd(item);
    }

    const pieStyles = item.itemType === "PIE_CLASSIC" ? classicPieStyles : custardPieStyles;
    const pieFlavors = item.itemType === "PIE_CLASSIC" ? classicPieFlavors : custardPieFlavors;

    return (
        <div className="item-builder">
            <div className="form-field">
                <label className="form-label">Item Type</label>
                <select className="form-input" value={item.itemType} onChange={e => setType(e.target.value as ItemType)}>
                    {(Object.keys(ITEM_TYPE_LABELS) as ItemType[]).map(t => (
                        <option key={t} value={t}>{ITEM_TYPE_LABELS[t]}</option>
                    ))}
                </select>
            </div>

            {/* ── Cake ── */}
            {item.itemType === "CAKE" && <>
                <div className="form-field">
                    <label className="form-label">Flavor <span className="form-required">*</span></label>
                    <select className="form-input" value={item.flavorId ?? ""} onChange={e => pickFlavor(cakeFlavors, +e.target.value, "flavorId", "flavorName")}>
                        <option value="">Select a flavor</option>
                        {cakeFlavors.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                </div>
                <div className="form-field">
                    <label className="form-label">Filling</label>
                    <select className="form-input" value={item.fillingId ?? ""} onChange={e => pickOption(fillings, +e.target.value, "fillingId", "fillingName")}>
                        <option value="">None</option>
                        {fillings.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                </div>
                <div className="form-field">
                    <label className="form-label">Buttercream / Frosting <span className="form-required">*</span></label>
                    <select className="form-input" value={item.buttercreamId ?? ""} onChange={e => pickOption(buttercreams, +e.target.value, "buttercreamId", "buttercreamName")}>
                        <option value="">Select a frosting</option>
                        {buttercreams.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                </div>
            </>}

            {/* ── Surprise Me ── */}
            {item.itemType === "SURPRISE_ME" && <>
                <p className="item-builder-note">
                    A fun 6-inch two-layer cake fully designed by the baker — just pick a flavor and tell us your color scheme!
                </p>
                <div className="form-field">
                    <label className="form-label">Flavor <span className="form-required">*</span></label>
                    <select className="form-input" value={item.flavorId ?? ""} onChange={e => pickFlavor(cakeFlavors, +e.target.value, "flavorId", "flavorName")}>
                        <option value="">Select a flavor</option>
                        {cakeFlavors.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                </div>
                <div className="form-field">
                    <label className="form-label">Color Scheme</label>
                    <input className="form-input" type="text" maxLength={500} placeholder="e.g. Blush pink, sage green, gold accents"
                        value={item.colorPreference} onChange={e => set("colorPreference", e.target.value)} />
                </div>
            </>}

            {/* ── Classic or Custard Pie ── */}
            {(item.itemType === "PIE_CLASSIC" || item.itemType === "PIE_CUSTARD") && <>
                <div className="form-field">
                    <label className="form-label">Flavor <span className="form-required">*</span></label>
                    <select className="form-input" value={item.flavorId ?? ""} onChange={e => pickFlavor(pieFlavors, +e.target.value, "flavorId", "flavorName")}>
                        <option value="">Select a flavor</option>
                        {pieFlavors.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                </div>
                <div className="form-field">
                    <label className="form-label">Style <span className="form-required">*</span></label>
                    <select className="form-input" value={item.pieStyleId ?? ""} onChange={e => pickOption(pieStyles, +e.target.value, "pieStyleId", "pieStyleName")}>
                        <option value="">Select a style</option>
                        {pieStyles.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                </div>
                {item.itemType === "PIE_CUSTARD" && (
                    <label className="form-checkbox-row">
                        <input type="checkbox" checked={item.glutenFree} onChange={e => set("glutenFree", e.target.checked)} />
                        <span>Gluten Free</span>
                    </label>
                )}
                <p className="item-builder-price">9-inch · $35</p>
            </>}

            {/* ── Cheesecake ── */}
            {item.itemType === "CHEESECAKE" && <>
                <div className="form-field">
                    <label className="form-label">Size <span className="form-required">*</span></label>
                    <select className="form-input" value={item.sizeId ?? ""} onChange={e => pickSize(cheesecakeSizes, +e.target.value)}>
                        <option value="">Select a size</option>
                        {cheesecakeSizes.map(o => (
                            <option key={o.id} value={o.id}>{o.label}{o.description ? ` — ${o.description}` : ""} · ${o.price}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label className="form-label">Flavor <span className="form-required">*</span></label>
                    <select className="form-input" value={item.flavorId ?? ""} onChange={e => pickFlavor(cheesecakeFlavors, +e.target.value, "flavorId", "flavorName")}>
                        <option value="">Select a flavor</option>
                        {cheesecakeFlavors.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                </div>
                <div className="form-field">
                    <label className="form-label">Crust <span className="form-required">*</span></label>
                    <select className="form-input" value={item.cheesecakeCrustId ?? ""} onChange={e => pickCrust(+e.target.value)}>
                        <option value="">Select a crust</option>
                        {cheesecakeCrusts.map(o => (
                            <option key={o.id} value={o.id}>{o.name}{o.glutenFree ? " (GF)" : ""}</option>
                        ))}
                    </select>
                </div>
            </>}

            {/* ── Macarons ── */}
            {item.itemType === "MACARON" && <>
                <p className="item-builder-price">One dozen · $36 · Choose two flavors</p>
                <div className="form-field">
                    <label className="form-label">First Flavor <span className="form-required">*</span></label>
                    <select className="form-input" value={item.flavorId ?? ""} onChange={e => pickFlavor(macaronFlavors, +e.target.value, "flavorId", "flavorName")}>
                        <option value="">Select a flavor</option>
                        {macaronFlavors.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                </div>
                <div className="form-field">
                    <label className="form-label">Second Flavor <span className="form-required">*</span></label>
                    <select className="form-input" value={item.flavor2Id ?? ""} onChange={e => pickFlavor(macaronFlavors, +e.target.value, "flavor2Id", "flavor2Name")}>
                        <option value="">Select a flavor</option>
                        {macaronFlavors.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                </div>
            </>}

            {/* ── Shared: comments + photos ── */}
            <div className="form-field">
                <label className="form-label">Item Notes</label>
                <textarea className="form-textarea" maxLength={2000} placeholder="Any details or special requests for this item…"
                    value={item.comments} onChange={e => set("comments", e.target.value)} />
            </div>

            <div className="form-field">
                <label className="form-label">Inspiration Photos</label>
                <input className="form-input" type="file" accept="image/jpeg,image/png,image/webp" multiple
                    onChange={e => handlePhotos(e.target.files)} />
                <span className="form-file-hint">JPEG, PNG, or WebP · max 10MB each</span>
            </div>

            {photoError && <p className="form-error">{photoError}</p>}

            <div className="item-builder-actions">
                <button type="button" className="form-submit" onClick={handleAdd}>Add to Order</button>
                <button type="button" className="btn-reject" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}

// ── Cart Item Summary ──────────────────────────────────────────────────────

function CartItemSummary({ item, index, onRemove }: { item: CartItem; index: number; onRemove: () => void }): ReactElement {
    const lines: string[] = [];
    if (item.flavorName)         lines.push(item.flavorName);
    if (item.flavor2Name)        lines.push(item.flavor2Name);
    if (item.fillingName)        lines.push(`Filling: ${item.fillingName}`);
    if (item.buttercreamName)    lines.push(`Frosting: ${item.buttercreamName}`);
    if (item.pieStyleName)       lines.push(`Style: ${item.pieStyleName}`);
    if (item.cheesecakeCrustName) lines.push(`Crust: ${item.cheesecakeCrustName}`);
    if (item.sizeLabel)          lines.push(item.sizeLabel);
    if (item.colorPreference)    lines.push(`Color: ${item.colorPreference}`);
    if (item.glutenFree)         lines.push("Gluten Free");
    if (item.comments)           lines.push(`Notes: ${item.comments}`);
    if (item.photos.length > 0)  lines.push(`${item.photos.length} photo${item.photos.length > 1 ? "s" : ""}`);

    return (
        <div className="cart-item">
            <div className="cart-item-header">
                <span className="cart-item-type">{ITEM_TYPE_LABELS[item.itemType]}</span>
                <span className="cart-item-index">Item {index + 1}</span>
                <button type="button" className="btn-icon" onClick={onRemove}>✕</button>
            </div>
            <ul className="cart-item-details">
                {lines.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
        </div>
    );
}

// ── OrderForm ──────────────────────────────────────────────────────────────

const fetchOptions = (url: string) => async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load options");
    return res.json();
};

export default function OrderForm(): ReactElement {
    const [customerName,     setCustomerName]     = useState("");
    const [email,            setEmail]            = useState("");
    const [phone,            setPhone]            = useState("");
    const [comments,         setComments]         = useState("");
    const [fulfillmentType,  setFulfillmentType]  = useState<"PICKUP" | "DROPOFF">("PICKUP");
    const [deliveryAddress,  setDeliveryAddress]  = useState("");
    const [fulfillmentDate,  setFulfillmentDate]  = useState("");
    const [smsConsent,       setSmsConsent]       = useState(false);

    const [cartItems,    setCartItems]    = useState<CartItem[]>([]);
    const [fixedQtys,    setFixedQtys]   = useState<Record<number, number>>({});
    const [showBuilder,  setShowBuilder] = useState(false);

    const [submitted, setSubmitted] = useState(false);
    const [error,     setError]     = useState("");
    const [loading,   setLoading]   = useState(false);

    // Options
    const { data: cakeFlavors       = [] } = useQuery<Option[]>      ({ queryKey: ["flavors", "CAKE"],        queryFn: fetchOptions("/api/options/flavors?itemType=CAKE"),         staleTime: Infinity });
    const { data: classicPieFlavors = [] } = useQuery<Option[]>      ({ queryKey: ["flavors", "PIE_CLASSIC"], queryFn: fetchOptions("/api/options/flavors?itemType=PIE_CLASSIC"),  staleTime: Infinity });
    const { data: custardPieFlavors = [] } = useQuery<Option[]>      ({ queryKey: ["flavors", "PIE_CUSTARD"], queryFn: fetchOptions("/api/options/flavors?itemType=PIE_CUSTARD"),  staleTime: Infinity });
    const { data: cheesecakeFlavors = [] } = useQuery<Option[]>      ({ queryKey: ["flavors", "CHEESECAKE"],  queryFn: fetchOptions("/api/options/flavors?itemType=CHEESECAKE"),   staleTime: Infinity });
    const { data: macaronFlavors    = [] } = useQuery<Option[]>      ({ queryKey: ["flavors", "MACARON"],     queryFn: fetchOptions("/api/options/flavors?itemType=MACARON"),       staleTime: Infinity });
    const { data: fillings          = [] } = useQuery<Option[]>      ({ queryKey: ["fillings"],               queryFn: fetchOptions("/api/options/fillings"),                       staleTime: Infinity });
    const { data: buttercreams      = [] } = useQuery<Option[]>      ({ queryKey: ["buttercreams"],           queryFn: fetchOptions("/api/options/buttercreams"),                   staleTime: Infinity });
    const { data: classicPieStyles  = [] } = useQuery<Option[]>      ({ queryKey: ["pieStyles", "CLASSIC"],  queryFn: fetchOptions("/api/options/pie-styles?pieType=CLASSIC"),     staleTime: Infinity });
    const { data: custardPieStyles  = [] } = useQuery<Option[]>      ({ queryKey: ["pieStyles", "CUSTARD"],  queryFn: fetchOptions("/api/options/pie-styles?pieType=CUSTARD"),     staleTime: Infinity });
    const { data: cheesecakeCrusts  = [] } = useQuery<CrustOption[]> ({ queryKey: ["cheesecakeCrusts"],      queryFn: fetchOptions("/api/options/cheesecake-crusts"),              staleTime: Infinity });
    const { data: cheesecakeSizes   = [] } = useQuery<SizeOption[]>  ({ queryKey: ["sizes", "CHEESECAKE"],   queryFn: fetchOptions("/api/options/sizes?itemType=CHEESECAKE"),      staleTime: Infinity });
    const { data: classicPieSizes   = [] } = useQuery<SizeOption[]>  ({ queryKey: ["sizes", "PIE_CLASSIC"],  queryFn: fetchOptions("/api/options/sizes?itemType=PIE_CLASSIC"),     staleTime: Infinity });
    const { data: custardPieSizes   = [] } = useQuery<SizeOption[]>  ({ queryKey: ["sizes", "PIE_CUSTARD"],  queryFn: fetchOptions("/api/options/sizes?itemType=PIE_CUSTARD"),     staleTime: Infinity });
    const { data: macaronSizes      = [] } = useQuery<SizeOption[]>  ({ queryKey: ["sizes", "MACARON"],      queryFn: fetchOptions("/api/options/sizes?itemType=MACARON"),         staleTime: Infinity });
    const { data: fixedProducts     = [] } = useQuery<FixedProduct[]>({ queryKey: ["fixedProducts"],         queryFn: fetchOptions("/api/options/fixed-products"),                 staleTime: Infinity });

    function validatePhone(raw: string): boolean {
        const digits = raw.replace(/\D/g, "");
        return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
    }

    function handleAddItem(item: CartItem) {
        setCartItems(prev => [...prev, item]);
        setShowBuilder(false);
    }

    function handleRemoveItem(index: number) {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    }

    function setFixedQty(productId: number, qty: number) {
        setFixedQtys(prev => ({ ...prev, [productId]: Math.max(0, qty) }));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");

        if (!validatePhone(phone)) { setError("Please enter a valid 10-digit US phone number."); return; }
        if (fulfillmentType === "DROPOFF" && !deliveryAddress.trim()) { setError("Please enter a delivery address."); return; }
        if (!fulfillmentDate) { setError("Please select a date."); return; }

        const hasFixedItems = fixedProducts.some(p => (fixedQtys[p.id] ?? 0) > 0);
        if (cartItems.length === 0 && !hasFixedItems) {
            setError("Please add at least one item to your order.");
            return;
        }

        setLoading(true);

        const payload = {
            customerName, email,
            phoneNumber: phone,
            comments: comments || null,
            fulfillmentType,
            deliveryAddress: fulfillmentType === "DROPOFF" ? deliveryAddress : null,
            fulfillmentDate,
            smsConsent,
            customItems: cartItems.map(item => ({
                itemType:           item.itemType,
                sizeId:             item.sizeId,
                quantity:           item.quantity,
                flavorId:           item.flavorId,
                flavor2Id:          item.flavor2Id,
                fillingId:          item.fillingId,
                buttercreamId:      item.buttercreamId,
                colorPreference:    item.colorPreference || null,
                pieStyleId:         item.pieStyleId,
                glutenFree:         item.glutenFree,
                cheesecakeCrustId:  item.cheesecakeCrustId,
                comments:           item.comments || null,
            })),
            fixedItems: fixedProducts
                .filter(p => (fixedQtys[p.id] ?? 0) > 0)
                .map(p => ({ fixedProductId: p.id, quantity: fixedQtys[p.id] })),
        };

        try {
            const res = await fetch("/api/orders", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(payload),
            });

            if (!res.ok) {
                setError((await res.text()) || "Something went wrong. Please try again.");
                return;
            }

            const { orderId, items } = await res.json();

            // Upload photos per item
            for (let i = 0; i < items.length; i++) {
                const photos = cartItems[i]?.photos ?? [];
                if (photos.length > 0) {
                    const formData = new FormData();
                    photos.forEach(p => formData.append("photos", p));
                    await fetch(`/api/orders/${orderId}/items/${items[i].id}/photos`, {
                        method: "POST",
                        body:   formData,
                    });
                }
            }

            setSubmitted(true);
        } catch {
            setError("Could not reach the server. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <div className="form-card form-success">
                <p className="form-success-title">Order Received!</p>
                <p className="form-success-text" style={{ marginTop: "0.75rem" }}>
                    Remember to check your spam or junk folder for email correspondence!
                </p>
            </div>
        );
    }

    return (
        <form className="form-card" onSubmit={handleSubmit}>

            {/* ── Contact info ── */}
            <div className="form-field">
                <label className="form-label" htmlFor="customerName">Name</label>
                <input className="form-input" id="customerName" type="text" value={customerName}
                    onChange={e => setCustomerName(e.target.value)} maxLength={100} required />
            </div>
            <div className="form-field">
                <label className="form-label" htmlFor="email">Email</label>
                <input className="form-input" id="email" type="email" value={email}
                    onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-field">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <input className="form-input" id="phone" type="tel" value={phone}
                    onChange={e => setPhone(e.target.value)} placeholder="(555) 555-5555" required />
            </div>

            {/* ── Fulfillment ── */}
            <div className="form-field">
                <label className="form-label">Fulfillment</label>
                <div className="form-radio-group">
                    <label className={`form-radio-option${fulfillmentType === "PICKUP" ? " selected" : ""}`}>
                        <input type="radio" name="fulfillmentType" value="PICKUP"
                            checked={fulfillmentType === "PICKUP"} onChange={() => setFulfillmentType("PICKUP")} />
                        Pickup
                    </label>
                    <label className={`form-radio-option${fulfillmentType === "DROPOFF" ? " selected" : ""}`}>
                        <input type="radio" name="fulfillmentType" value="DROPOFF"
                            checked={fulfillmentType === "DROPOFF"} onChange={() => setFulfillmentType("DROPOFF")} />
                        Delivery
                    </label>
                </div>
            </div>
            {fulfillmentType === "DROPOFF" && (
                <div className="form-field">
                    <label className="form-label" htmlFor="deliveryAddress">Delivery Address</label>
                    <input className="form-input" id="deliveryAddress" type="text" value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        placeholder="123 Main St, City, State, ZIP" maxLength={500} required />
                </div>
            )}
            <div className="form-field">
                <label className="form-label" htmlFor="fulfillmentDate">
                    {fulfillmentType === "DROPOFF" ? "Delivery Date" : "Pickup Date"}
                </label>
                <input className="form-input" id="fulfillmentDate" type="date" value={fulfillmentDate}
                    onChange={e => setFulfillmentDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]} required />
            </div>

            {/* ── Custom Items ── */}
            <div className="form-section-label">Your Items</div>

            {cartItems.map((item, i) => (
                <CartItemSummary key={i} item={item} index={i} onRemove={() => handleRemoveItem(i)} />
            ))}

            {showBuilder ? (
                <ItemBuilder
                    cakeFlavors={cakeFlavors}
                    classicPieFlavors={classicPieFlavors}
                    custardPieFlavors={custardPieFlavors}
                    cheesecakeFlavors={cheesecakeFlavors}
                    macaronFlavors={macaronFlavors}
                    fillings={fillings}
                    buttercreams={buttercreams}
                    classicPieStyles={classicPieStyles}
                    custardPieStyles={custardPieStyles}
                    cheesecakeCrusts={cheesecakeCrusts}
                    cheesecakeSizes={cheesecakeSizes}
                    classicPieSizes={classicPieSizes}
                    custardPieSizes={custardPieSizes}
                    macaronSizes={macaronSizes}
                    onAdd={handleAddItem}
                    onCancel={() => setShowBuilder(false)}
                />
            ) : (
                <button type="button" className="btn-add-item" onClick={() => setShowBuilder(true)}>
                    + Add Item
                </button>
            )}

            {/* ── Fixed / Add-on Items ── */}
            {fixedProducts.length > 0 && (
                <>
                    <div className="form-section-label">Add-Ons</div>
                    <div className="fixed-items-list">
                        {fixedProducts.map(p => (
                            <div key={p.id} className="fixed-item-row">
                                <div className="fixed-item-info">
                                    <span className="fixed-item-name">{p.name}</span>
                                    <span className="fixed-item-meta">{p.unitDescription} · ${p.price.toFixed(2)}</span>
                                    {p.description && <span className="fixed-item-desc">{p.description}</span>}
                                </div>
                                <div className="fixed-item-qty">
                                    <button type="button" className="qty-btn"
                                        onClick={() => setFixedQty(p.id, (fixedQtys[p.id] ?? 0) - 1)}>−</button>
                                    <span className="qty-value">{fixedQtys[p.id] ?? 0}</span>
                                    <button type="button" className="qty-btn"
                                        onClick={() => setFixedQty(p.id, (fixedQtys[p.id] ?? 0) + 1)}>+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* ── Order-level comments ── */}
            <div className="form-field" style={{ marginTop: "1.5rem" }}>
                <label className="form-label" htmlFor="comments">Order Notes</label>
                <textarea className="form-textarea" id="comments" value={comments}
                    onChange={e => setComments(e.target.value)}
                    placeholder="Any notes that apply to the whole order…"
                    maxLength={2000} />
            </div>

            {error && <p className="form-error">{error}</p>}

            {/* ── SMS Consent ── */}
            <div className="sms-consent">
                <label className="sms-consent-row">
                    <input type="checkbox" checked={smsConsent} onChange={e => setSmsConsent(e.target.checked)} />
                    <span className="consent-text">
                        <strong>Opt in to receive order status updates via text message from ConfectionCo Bakery.</strong>{" "}
                        Order confirmations and payment links will always be sent to your email. SMS updates are optional and not required to place or complete your order.
                    </span>
                </label>
                <p className="rates-note">
                    Message frequency varies. Msg &amp; data rates may apply.
                    Reply <strong>STOP</strong> to opt out at any time. Reply <strong>HELP</strong> for assistance.
                    View our <a href="/privacy-policy">Privacy Policy</a> and <a href="/terms-and-conditions">Terms &amp; Conditions</a>.
                </p>
            </div>

            <button className="form-submit" type="submit" disabled={loading || showBuilder}>
                {loading ? "Submitting…" : "Submit Order"}
            </button>
        </form>
    );
}
