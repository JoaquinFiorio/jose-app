import React, { useState } from "react";

export default function ReferralCodeBox({ referralCode = "" }) {
    const [copied, setCopied] = useState(false);
    const baseUrl = "https://suplentes4.incidentq.com/register?referral=";
    const fullReferralLink = referralCode ? baseUrl + referralCode : "";

    const handleCopy = async () => {
        if (!fullReferralLink) return;
        try {
            await navigator.clipboard.writeText(fullReferralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            setCopied(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 flex flex-col items-center justify-center md:col-span-1">
            <h3 className="text-yellow-600 text-lg font-semibold mb-4">Código para referir</h3>
            <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xl bg-gray-100 px-4 py-2 rounded break-all">
                    {referralCode || "—"}
                </span>
                <button
                    onClick={handleCopy}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition font-bold flex items-center gap-2"
                    disabled={copied || !referralCode}
                >
                    <span>Copiar</span>
                    <span>{copied ? "✅" : "📋"}</span>
                </button>
            </div>
            {copied && <div className="text-green-600 font-medium mt-2">¡Copiado!</div>}
        </div>
    );
}
