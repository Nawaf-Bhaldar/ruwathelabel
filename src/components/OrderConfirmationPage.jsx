// src/components/OrderConfirmationPage.jsx
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config/api";
import { ApiCheckPaymentStatus, ApiPlaceOrderGuest } from "../api/Payment";
import { apiGetOrderDetailById } from "../api/Order";

const Container = ({ children }) => (
  <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
);

export default function OrderConfirmationPage({ setPage }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    async function finalize() {
      const orderId = localStorage.getItem("orderId");
      const paymentId = localStorage.getItem("paymentId");
      const paymentMethod = localStorage.getItem("paymentMethod");
      const customer = JSON.parse(localStorage.getItem("CustomerInfo"));
      const shipping =
        JSON.parse(localStorage.getItem("ShippingCost"))?.deliveryCharges || 0;

      // 1) Confirm payment
      const status = await ApiCheckPaymentStatus(paymentId);
      if (!status?.IsSuccess) {
        alert("Payment failed. Contact support.");
        return;
      }

      // 2) Send order to backend
      const cartItems = JSON.parse(localStorage.getItem("checkoutItems")) || [];

      await ApiPlaceOrderGuest(
        {
          appUserId: customer?.appUserId || 0,
          AddressId: customer?.addressId || 0,
          ShippingCost: shipping,
          PaymentId: paymentId,
          PaymentMethod: paymentMethod,
          VoucherCode: null,
          VoucherDiscount: 0,
        },
        cartItems
      );

      // 3) Fetch final invoice
      const details = await apiGetOrderDetailById(orderId);
      setOrder(details);

      // 4) Cleanup
      localStorage.removeItem("checkoutItems");
      localStorage.removeItem("paymentId");
      localStorage.removeItem("paymentMethod");
    }

    finalize();
  }, []);

  const printInvoice = () => {
    if (!order) return;

    const w = window.open("", "_blank");

    w.document.write(`
      <html>
      <head><title>Invoice</title></head>
      <body style="font-family: Arial; padding: 20px;">
        <h2 style="text-align:center;">Invoice #RUWA-${order.id}</h2>
        <p style="text-align:center;">${new Date(
          order.createdDate
        ).toLocaleString()}</p>
        <hr>
        ${order.orderItems
          .map(
            (item) => `
            <div style="margin-bottom:12px;">
              <img src="${
                BASE_URL + item.product.productImages[0].imagePath
              }" width="50" height="50"/>
              <strong>${item.product.name}</strong> × ${item.quantity}<br/>
              Price: KD ${(item.product.salePrice * item.quantity).toFixed(3)}
            </div>
          `
          )
          .join("")}
        <hr>
        <h3 style="text-align:right;">Total: KD ${order.totalAmount}</h3>
      </body>
      </html>
    `);

    w.document.close();
    w.print();
  };

  if (!order)
    return (
      <div className="py-32 text-center text-neutral-700 font-[Montserrat] text-sm">
        Finalizing your order...
      </div>
    );

  return (
    <main className="bg-white min-h-screen py-16">
      <Container>
        <div className="text-center font-[Montserrat]">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="green"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="w-9 h-9"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-neutral-900 tracking-wide">
            Thank You for Your Order!
          </h1>

          <p className="text-sm text-neutral-600 mt-2">
            Your order <b>#RUWA-{order.id}</b> has been placed successfully.
          </p>

          {/* Invoice Button */}
          <button
            onClick={printInvoice}
            className="mt-8 px-6 py-2 text-xs bg-black text-white rounded-md tracking-wide hover:bg-neutral-900 transition"
          >
            PRINT INVOICE
          </button>

          {/* Continue shopping */}
          <button
            onClick={() => setPage("home")}
            className="block mx-auto mt-4 text-xs text-blue-600 hover:underline"
          >
            Continue Shopping
          </button>
        </div>
      </Container>
    </main>
  );
}
