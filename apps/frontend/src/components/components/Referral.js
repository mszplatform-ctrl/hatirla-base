import React, { useState } from 'react';

export default function Referral() {
    const [code, setCode] = useState("");

    const generateReferral = async () => {
        try {
            const userId = "123"; // Mock userId, login sonrası dinamik olacak
            const res = await fetch("http://localhost:4000/api/referral/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            setCode(data.code);
        } catch (err) {
            alert("Hata: " + err);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        alert("Kopyalandı: " + code);
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <h3>Referral Kodunu Al</h3>
            <button onClick={generateReferral}>Kod Oluştur</button>
            <input type="text" readOnly value={code} style={{ marginLeft: '10px' }} placeholder="Kod burada görünecek"/>
            <button onClick={copyToClipboard} style={{ marginLeft: '10px' }}>Kopyala</button>
        </div>
    );
}
