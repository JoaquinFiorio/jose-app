import React from "react";

export default function PaymentStep({ paymentId }) {
    console.log(paymentId);
    // Si no hay paymentId, puedes mostrar un loader o mensaje de error
    if (!paymentId) {
        return <div className="w-full flex flex-col items-center p-8">Cargando información de pago...</div>;
    }

    return (
        <div className="w-full flex flex-col items-center p-8">
            <h2 className="text-center text-2xl font-semibold mb-6">
                Realiza el pago mediante tu wallet<br />con el siguiente QR
            </h2>
            <iframe
                src={`https://nowpayments.io/embeds/payment-widget?iid=${paymentId}`}
                width={410}
                height={600}
                frameBorder={0}
                scrolling="no"
                style={{ overflowY: "hidden" }}
                title="Pago con NOWPayments"
            >
                Can't load widget
            </iframe>
        </div>
    );
}
