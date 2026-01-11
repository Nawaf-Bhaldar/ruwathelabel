import { API_BASE_URL } from "/src/config/api.js";

// ✅ Normal order endpoint (used after user exists or is created)
export async function PlaceOrder(formData, items) {
  const params = new URLSearchParams({
    appUserId: formData.appUserId,
    AddressId: formData.AddressId,
    ShippingCost: formData.ShippingCost,
    VoucherCode: formData.VoucherCode ?? "",
    VoucherDiscount: formData.VoucherDiscount ?? 0,
  });

  const url = `${API_BASE_URL}Order/PlaceOrder?${params.toString()}`;

  try {
    const res = await fetch(url, { method: "GET" });
    return await res.json();
  } catch (err) {
    console.error("❌ PlaceOrder Error:", err);
    return { status: false, message: "Network error" };
  }
}

export async function PlaceOrderGuest(formData, items) {
  const payload = {
    appUserId: formData.appUserId,
    AddressId: formData.AddressId,
    ShippingCost: formData.ShippingCost,
    VoucherCode: formData.VoucherCode || null,
    VoucherDiscount: formData.VoucherDiscount || 0,
    data: items,
  };

  try {
    const res = await fetch(`${API_BASE_URL}Order/PlaceOrderGuest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (err) {
    console.error("❌ PlaceOrderGuest Error:", err);
    return { status: false, message: "Network error" };
  }
}

export async function apiGetOrderDetailById(orderId) {
  const res = await fetch(
    API_BASE_URL + `Order/GetOrderDetailById?orderId=${orderId}`
  );
  return await res.json();
}
