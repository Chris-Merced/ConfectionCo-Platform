import { useState, type ReactElement } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Option {
    id: number;
    name: string;
}

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
        onSuccess: () => {
            setNewName("");
            queryClient.invalidateQueries({ queryKey: [queryKey] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(deleteUrl(id), {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
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
                        <button
                            className="btn-icon"
                            onClick={() => deleteMutation.mutate(opt.id)}
                            disabled={deleteMutation.isPending}
                        >
                            ✕
                        </button>
                    </li>
                ))}
            </ul>
            <div className="options-add-row">
                <input
                    className="form-input"
                    type="text"
                    placeholder={`Add ${label.toLowerCase()}...`}
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && newName.trim()) addMutation.mutate(); }}
                    maxLength={100}
                />
                <button
                    className="btn-accept"
                    onClick={() => addMutation.mutate()}
                    disabled={!newName.trim() || addMutation.isPending}
                >
                    Add
                </button>
            </div>
            {(addMutation.error || deleteMutation.error) && (
                <p className="order-card-error">{(addMutation.error || deleteMutation.error as Error)?.message}</p>
            )}
        </div>
    );
}

interface OptionsManagerProps {
    token: string;
}

export default function OptionsManager({ token }: OptionsManagerProps): ReactElement {
    const [open, setOpen] = useState(false);

    return (
        <div className="options-manager">
            <button className="options-manager-toggle" onClick={() => setOpen(o => !o)}>
                Manage Options {open ? "▾" : "▸"}
            </button>
            {open && (
                <div className="options-manager-body">
                    <CategoryPanel
                        label="Flavors"
                        fetchUrl="/api/options/flavors"
                        addUrl="/api/admin/options/flavors"
                        deleteUrl={id => `/api/admin/options/flavors/${id}`}
                        queryKey="flavors"
                        token={token}
                    />
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
                </div>
            )}
        </div>
    );
}
