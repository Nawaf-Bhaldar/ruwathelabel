// src/components/PayNowPage.jsx
import React, { useEffect, useState } from "react";
import { ApiGetPaymentMethod, ApiExcutePayment } from "../api/Payment";

const Container = ({ children }) => (
  <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
);

export default function PayNowPage({ setPage }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const totalAmount = Number(localStorage.getItem("totalAmount")) || 0;
  const orderId = localStorage.getItem("orderId");
  const customer = JSON.parse(localStorage.getItem("CustomerInfo")) || {};

  // When payment gateway returns to page
  useEffect(() => {
    const url = new URLSearchParams(window.location.search);
    const returnedPaymentId = url.get("paymentId");

    if (returnedPaymentId) {
      localStorage.setItem("paymentId", returnedPaymentId);
      setPage("orderconfirmation");
    }
  }, []);

  // Load MyFatoorah payment methods
  useEffect(() => {
    ApiGetPaymentMethod({
      InvoiceValue: totalAmount,
      CurrencyIso: "KWD",
    }).then((res) => {
      if (res?.Data?.PaymentMethods) {
        setPaymentMethods(res.Data.PaymentMethods);
      }
    });
  }, [totalAmount]);

  const handlePay = async () => {
    if (!selected) return;

    setLoading(true);

    const payload = {
      OrderId: orderId,
      InvoiceValue: totalAmount,
      CurrencyIso: "KWD",
      PaymentMethodId: selected.PaymentMethodId,
      CustomerName: customer.firstName || "Guest",
      CustomerEmail: customer.email || "",
      AddressId: JSON.parse(localStorage.getItem("AddressId")) || 0,
      DeliveryCharges:
        JSON.parse(localStorage.getItem("ShippingCost"))?.deliveryCharges || 0,
    };

    const res = await ApiExcutePayment(payload);

    if (res?.IsSuccess && res?.Data?.PaymentURL) {
      // Store data for confirmation
      localStorage.setItem("paymentMethod", selected.PaymentMethodEn);
      localStorage.setItem("paymentId", res.Data.PaymentId);
      localStorage.setItem("checkoutItems", localStorage.getItem("cartItems"));

      // Clear the cart now
      localStorage.removeItem("cart");
      localStorage.removeItem("cartItems");

      // Redirect user to gateway
      window.location.href = res.Data.PaymentURL;
    } else {
      alert("Payment failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <main className="py-12 min-h-screen bg-white">
      <Container>
        {/* Back Button */}
        <button
          onClick={() => setPage("checkout")}
          className="mb-6 text-sm text-neutral-600 rounded-full px-4 py-1 hover:bg-neutral-100 transition"
        >
          ← Back
        </button>

        <h1 className="text-xl font-[Montserrat] tracking-wide text-neutral-900 text-center mb-8">
          Choose Your Payment Method
        </h1>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((m) => (
            <button
              key={m.PaymentMethodId}
              onClick={() => setSelected(m)}
              className={`
                border rounded-xl p-6 flex flex-col items-center gap-4 bg-white shadow-sm 
                transition font-[Montserrat]
                ${
                  selected?.PaymentMethodId === m.PaymentMethodId
                    ? "border-neutral-900 shadow-md"
                    : "border-neutral-200 hover:border-neutral-400"
                }
              `}
            >
              <img src={m.ImageUrl} alt={m.PaymentMethodEn} className="h-10" />
              <p className="text-sm text-neutral-700 tracking-wide">
                {m.PaymentMethodEn}
              </p>
            </button>
          ))}
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={loading || !selected}
          className={`
            w-full mt-10 py-3 rounded-md text-xs font-[Montserrat] tracking-wide 
            transition
            ${
              selected
                ? "bg-black text-white hover:bg-neutral-900"
                : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
            }
          `}
        >
          {loading ? "Processing..." : "PAY NOW"}
        </button>
      </Container>
    </main>
  );
}
