import React, { useState, useEffect } from "react";
import { GetVouchers } from "../../services/VoucherService";

const DiscountSection = ({
  grandtotal,
  onFinalPriceChange,
  setVoucherDiscount,
  setVoucherCode,
  setVoucherVendorId,
}) => {
  const [code, setCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [finalPrice, setFinalPrice] = useState(grandtotal);
  const [error, setError] = useState("");
  const [activeVoucher, setActiveVoucher] = useState(null);

  const applyDiscount = async () => {
    const match = await GetVouchers(code);

    if (match.status) {
      setActiveVoucher(match.data);
      setVoucherVendorId(match.data.vendorId);
      setDiscountApplied(true);
      setVoucherCode(match.data.code || code);
      setError("");
    } else {
      setError("Invalid or expired voucher.");
      setDiscountApplied(false);
      setActiveVoucher(null);
    }
  };

  useEffect(() => {
    if (discountApplied && activeVoucher) {
      let updated = grandtotal;

      if (activeVoucher.discountType === "percentage") {
        const discount = (grandtotal * activeVoucher.value) / 100;
        updated = grandtotal - discount;
        setVoucherDiscount(discount);
      } else if (activeVoucher.discountType === "fixed") {
        updated = grandtotal - activeVoucher.value;
        setVoucherDiscount(activeVoucher.value);
      }

      if (updated < 0) updated = 0;

      setFinalPrice(updated);
      onFinalPriceChange(updated);
    } else {
      setFinalPrice(grandtotal);
    }
  }, [grandtotal, discountApplied, activeVoucher]);

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900 tracking-wide mb-3">
        DISCOUNT CODE
      </h2>

      {/* Input + Apply */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter voucher"
          className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm font-[Montserrat] focus:ring-1 focus:ring-neutral-400"
        />

        <button
          onClick={applyDiscount}
          className="px-4 py-2 bg-black text-white text-xs rounded-md tracking-wide hover:bg-neutral-900 transition"
        >
          APPLY
        </button>
      </div>

      {/* Errors */}
      {error && (
        <p className="text-red-500 text-xs mt-2 font-[Montserrat]">{error}</p>
      )}

      {/* Success message */}
      {discountApplied && (
        <p className="text-green-600 text-xs mt-2 font-[Montserrat]">
          Discount applied successfully!
        </p>
      )}
    </div>
  );
};

export default DiscountSection;
