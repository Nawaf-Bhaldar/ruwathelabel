import React, { useState, useEffect } from "react";
import FastCheckout from "./FastCheckout";
import AddressForm from "./checkout/AddressForm";
import DiscountSection from "./checkout/DiscountSection";

import { ApiAddAddress } from "../api/Address";
import { PlaceOrderGuest } from "../api/Order";
import { apiCalculateShippingCost } from "../services/ShippingCostServises";
// import { SUBDOMAIN_VENDOR_MAP } from "../App";
import { API_BASE_URL } from "/src/config/api.js";
import { USER_ID } from "/src/config/api.js";

/* Container */
const Container = ({ children }) => (
  <div className="mx-auto max-w-full px-4 sm:px-6 lg:max-w-6xl">{children}</div>
);

const CheckoutPage = ({ items, subtotal, setPage, goBack }) => {
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState({});
  const [loading, setLoading] = useState(false);
  const [finalTotal, setFinalTotal] = useState(subtotal);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherCode, setVoucherCode] = useState(null);

  /* Shipping Cost */
  const shippingCost =
    Number(JSON.parse(localStorage.getItem("ShippingCost"))?.deliveryCharges) ||
    0;

  /* Update total on discount or shipping change */
  useEffect(() => {
    setFinalTotal(subtotal + shippingCost - voucherDiscount);
  }, [subtotal, shippingCost, voucherDiscount]);

  /* Prefill */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("CustomerInfo"));
    if (saved) setShipping(saved);
  }, [step]);

  /* Fetch shipping */
  useEffect(() => {
    async function fetchShippingCost() {
      try {
        const res = await apiCalculateShippingCost({
          cartItems: items.map((i) => ({
            productId: i.id,
            quantity: i.qty,
            salePrice:
              i.product?.salePrice ||
              i.product?.price ||
              i.product?.productPrice ||
              i.product?.sellingPrice ||
              0,
          })),
          country: shipping.country || "Kuwait",
        });

        if (res?.status && typeof res.data === "number") {
          const updated = { deliveryCharges: res.data };
          localStorage.setItem("ShippingCost", JSON.stringify(updated));
          setFinalTotal(subtotal + res.data - voucherDiscount);
        }
      } catch (err) {
        console.error("Error fetching shipping:", err);
      }
    }

    fetchShippingCost();
  }, [items, shipping.country]);

  /* PLACE ORDER */
  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // SAFELY detect vendor (no fallback)
      // const hostname = window.location.hostname
      //   .replace(/^www\./, "")
      //   .toLowerCase();
      // const slug = hostname.split(".")[0];

      // // get vendor ONLY if mapping exists
      // const detectedVendor =
      //   SUBDOMAIN_VENDOR_MAP[hostname] || SUBDOMAIN_VENDOR_MAP[slug];

      // // use vendorId from mapping ONLY if exists
      // let vendorId = Number(localStorage.getItem("vendorId"));

      // if (detectedVendor?.vendorId) {
      //   vendorId = Number(detectedVendor.vendorId);
      // }
      // HARD CODED VENDOR ID (simple & clean)
      let vendorId = Number(USER_ID);

      const customerInfo = JSON.parse(localStorage.getItem("CustomerInfo"));

      let addressId = shipping.addressId;
      console.log("📌 AddressId BEFORE saving:", addressId);

      // 🧩 Ensure customer exists (CreateCustomer if new)
      let appUserId = Number(
        customerInfo?.appUserId || shipping.appUserId || 0
      );

      if (!appUserId || appUserId === 0) {
        const createPayload = {
          firstName: shipping.firstName || "",
          lastName: shipping.lastName || "",
          CountryCode: shipping.CountryCode || "+965",
          email: shipping.email || "",
          country: shipping.country || "Kuwait",
          state: shipping.state || "",
          city: shipping.city || "",
          addressType: shipping.addressType || "flat",
          block: shipping.block || "",
          street: shipping.street || "",
          house: shipping.house || "",
          UserType: "Customer",
          mobile: shipping.mobile,
          ZipCode: shipping.zip || "",
          vendorId: Number(localStorage.getItem("vendorId")) || vendorId,
        };

        console.log("📤 CreateCustomer payload:", createPayload);

        const formData = new FormData();
        Object.entries(createPayload).forEach(([key, value]) => {
          if (value !== undefined && value !== null)
            formData.append(key, value);
        });

        const createCustomerRes = await fetch(
          `${API_BASE_URL}Account/CreateCustomer`,
          {
            method: "POST",
            body: formData, // ✅ no Content-Type header needed
          }
        );

        const newCustomer = await createCustomerRes.json();
        console.log("🧾 Created new customer:", newCustomer);

        if (!newCustomer?.status || !newCustomer?.data) {
          alert("Failed to create customer before placing order");
          setLoading(false);
          return;
        }

        appUserId = Number(newCustomer.data);

        // ✅ Save to localStorage and state
        const updatedInfo = { ...shipping, appUserId };
        localStorage.setItem("CustomerInfo", JSON.stringify(updatedInfo));
        setShipping(updatedInfo);
      }

      if (!addressId) {
        const addressPayload = {
          id: 0,
          addressType: shipping.addressType || "flat",
          country: shipping.country || "Kuwait",
          state: shipping.state || "",
          city: shipping.city || "",
          address1: shipping.street || "",
          address2: shipping.block || "",
          houseNumber: shipping.house || "",
          zipCode: shipping.zip || "",
          isDefault: true,
          appUserId, // ✅ updated here
        };

        const addrRes = await ApiAddAddress(addressPayload);
        console.log("🧾 AddAddress response:", addrRes);

        if (!addrRes?.status) {
          alert(addrRes?.message || "Could not save address. Check details.");
          setLoading(false);
          return;
        }

        // handle different possible data formats
        if (Array.isArray(addrRes.data) && addrRes.data.length > 0) {
          addressId = addrRes.data[0].id;
        } else if (addrRes.data?.id) {
          addressId = addrRes.data.id;
        } else {
          addressId = addrRes.data;
        }

        console.log("✅ AddressId AFTER API save:", addressId);

        console.log("✅ AddressId AFTER API save:", addressId);
      }

      const orderItems = items.map((it) => ({
        productId: it.id,
        salePrice: Number(it.price),
        quantity: Number(it.qty),
        vendorId: vendorId,
        note: shipping.notes || "",

        // STEP 3: BUILD CORRECT LIVE FORMAT
        productOptionStockItems: it.productOptionStockItemIds || [],
      }));

      // ✅ Ensure appUserId is correctly captured from latest data
      const appUserIdFinal =
        shipping.appUserId ||
        customerInfo?.appUserId ||
        appUserId || // from earlier CreateCustomer call
        0;

      if (!appUserIdFinal || appUserIdFinal === 0) {
        alert("Missing customer ID before placing order!");
        setLoading(false);
        return;
      }

      const formData = {
        appUserId: appUserIdFinal,
        AddressId: addressId,
        ShippingCost: shippingCost,
        VoucherCode: voucherCode || null,
        VoucherDiscount: Number(voucherDiscount || 0),
        vendorId: vendorId, // ✅ ADD THIS
      };

      console.log("📤 FINAL ORDER PAYLOAD:", { formData, data: orderItems });

      // const res = await PlaceOrderGuest(formData, orderItems);
      console.log(
        "⚠️ ORDER ITEMS SENT TO API:",
        JSON.stringify(orderItems, null, 2)
      );

      const res = await PlaceOrderGuest(formData, orderItems);
      // const res = await PlaceOrder(formData, orderItems);
      console.log("📥 ORDER RESPONSE:", res);

      if (!res?.status) {
        alert(res?.message || "Order failed");
        return;
      }

      localStorage.setItem("orderId", res.data);
      localStorage.setItem("totalAmount", finalTotal.toFixed(3));
      localStorage.setItem("checkoutItems", JSON.stringify(orderItems));

      setPage("paynow");
    } catch (err) {
      console.error("❌ Error placing order:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-8 pb-20 min-h-screen bg-white">
      <Container>
        {/* BACK BUTTON */}
        <button
          onClick={goBack}
          className="mb-6 text-sm text-neutral-600 rounded-full px-4 py-1 hover:bg-neutral-100 transition"
        >
          ← Back
        </button>

        <h1 className="text-xl font-[Montserrat] tracking-wide text-neutral-900">
          CHECKOUT
        </h1>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* LEFT SIDE */}
          <div className="col-span-1 lg:col-span-8 space-y-6">
            {step === 1 && (
              <FastCheckout
                setFastCheckout={(verified) => {
                  if (verified) setStep(2);
                }}
                setUserVerified={() => {}}
                userVerified={false}
              />
            )}

            {step === 2 && (
              <div className="rounded-xl border border-neutral-200 p-6 bg-white shadow-sm text-sm space-y-4">
                <div className="font-medium text-base">Shipping Info</div>

                {/* NAME */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={shipping.firstName || ""}
                    onChange={(e) =>
                      setShipping({ ...shipping, firstName: e.target.value })
                    }
                    placeholder="First Name"
                    className="border border-neutral-300 rounded-lg px-3 py-2"
                  />

                  <input
                    value={shipping.lastName || ""}
                    onChange={(e) =>
                      setShipping({ ...shipping, lastName: e.target.value })
                    }
                    placeholder="Last Name"
                    className="border border-neutral-300 rounded-lg px-3 py-2"
                  />
                </div>

                {/* EMAIL */}
                <input
                  value={shipping.email || ""}
                  onChange={(e) =>
                    setShipping({ ...shipping, email: e.target.value })
                  }
                  placeholder="Email"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                />

                {/* ADDRESS */}
                <AddressForm formData={shipping} setFormData={setShipping} />

                {/* DISCOUNT */}
                <DiscountSection
                  grandtotal={subtotal}
                  onFinalPriceChange={setFinalTotal}
                  setVoucherDiscount={setVoucherDiscount}
                  setVoucherCode={setVoucherCode}
                />

                {/* NOTES */}
                <textarea
                  value={shipping.notes || ""}
                  onChange={(e) =>
                    setShipping({ ...shipping, notes: e.target.value })
                  }
                  placeholder="Special notes (optional)"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 min-h-[60px]"
                />

                {/* BUTTON */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-black text-white text-sm py-2.5 rounded-lg hover:bg-neutral-900 transition"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SIDE SUMMARY */}
          <div className="col-span-1 lg:col-span-4 space-y-4">
            {/* ITEMS */}
            <div className="rounded-xl border border-neutral-200 p-4 bg-white shadow-sm">
              <div className="text-sm font-medium mb-3">Items</div>

              <div className="space-y-3 max-h-[320px] overflow-auto pr-1">
                {items.map((it, idx) => {
                  const unitPrice =
                    it.product?.salePrice ||
                    it.product?.price ||
                    it.product?.productPrice ||
                    it.product?.sellingPrice ||
                    it.price ||
                    0;

                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-[64px_1fr_auto] gap-3"
                    >
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-neutral-100">
                        <img
                          src={it.img || it.product?.img}
                          alt={it.product?.name || it.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="text-xs text-neutral-700">
                        <div className="font-medium text-neutral-900">
                          {it.product?.name || it.name}
                        </div>
                        <div>
                          Size: {it.size} · Qty: {it.qty}
                        </div>
                      </div>

                      <div className="text-xs text-neutral-900">
                        KD {(unitPrice * it.qty).toFixed(3)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="text-neutral-600">Subtotal</div>
                <div className="text-neutral-900">KD {subtotal.toFixed(3)}</div>
              </div>
            </div>

            {/* PAYMENT SUMMARY */}
            <div className="rounded-xl border border-neutral-200 p-4 bg-white shadow-sm text-sm space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>KD {subtotal.toFixed(3)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>KD {shippingCost.toFixed(3)}</span>
              </div>

              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="text-green-600">
                  - KD {voucherDiscount.toFixed(3)}
                </span>
              </div>

              <hr />

              <div className="flex justify-between font-semibold text-base">
                <span>Grand Total:</span>
                <span>KD {finalTotal.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
};

export default CheckoutPage;
