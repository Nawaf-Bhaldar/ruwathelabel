import { API_BASE_URL } from "/src/config/api.js";

export async function ApiGetPaymentMethod(payload) {
  const response = await fetch(API_BASE_URL + "Order/InitiatePayment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await response.json();
}

export async function ApiExcutePayment(payload) {
  const response = await fetch(API_BASE_URL + "Order/ExecutePayment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await response.json();
}

// export async function ApiPlaceOrderGuest(formData, cartItems) {
//   const response = await fetch(API_BASE_URL + `Order/PlaceOrderGuest`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       data: cartItems,
//       appUserId: formData.appUserId,
//       addressId: formData.AddressId,
//       shippingCost: formData.ShippingCost,
//       paymentId: formData.PaymentId,
//       paymentMethod: formData.PaymentMethod,
//       voucherCode: formData.voucherCode,
//       voucherDiscount: formData.voucherDiscount,
//     }),
//   });

//   return await response.json();
// }
export async function ApiCheckPaymentStatus(paymentId) {
  const response = await fetch(
    API_BASE_URL + `Order/GetPaymentStatus?paymentId=${paymentId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return await response.json();
}

export async function ApiPlaceOrderGuest(formData, cartItems) {
  const payload = {
    appUserId: formData.appUserId || 0,
    AddressId: formData.AddressId, // ✅ Correct casing
    ShippingCost: formData.ShippingCost, // ✅ Correct casing
    VoucherCode: formData.voucherCode || null,
    VoucherDiscount: formData.voucherDiscount || 0,

    data: cartItems,
  };

  console.log("✅ FIXED FINAL ORDER PAYLOAD:", payload);

  const response = await fetch(API_BASE_URL + `Order/PlaceOrderGuest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await response.json();
}
