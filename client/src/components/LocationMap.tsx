import type { ReactElement } from "react";

export default function LocationMap(): ReactElement {
    return (
        <iframe
            title="Hodges Bayou Plantation"
            src="https://maps.google.com/maps?q=101+Spikes+Cir,+Southport,+FL&output=embed&z=15"
            width="100%"
            height="400"
            style={{ border: 0, borderRadius: "8px", display: "block" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        />
    );
}
