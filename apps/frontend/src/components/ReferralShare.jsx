import { useState } from "react";

export default function ReferralShare({ userId }) {
    const [code, setCode] = useState("");
    const [copied, setCopied] = useState(false);

    const generate = async () => {
        const API_BASE = import.meta.env.VITE_API_URL || 'https://hatirla-base.onrender.com';
        const res = await fetch(`${API_BASE}/api/referral/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
        });

        const data = await res.json();
        setCode(data.code);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 10 }}>
            <h3>Referral Paylaşımı</h3>

            <button onClick={generate}>
                Kod Oluştur
            </button>

            {code && (
                <div style={{ marginTop: 10 }}>
                    <p>Kod: <b>{code}</b></p>
                    <button onClick={copyToClipboard}>
                        Kopyala
                    </button>
                    {copied && <span style={{ marginLeft: 10 }}>✔ Kopyalandı</span>}
                </div>
            )}
        </div>
    );
}
