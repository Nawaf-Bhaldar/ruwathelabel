import React from "react";

/* Simple container */
const Container = ({ children }) => (
  <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
);

/* Qty Component */
const Qty = ({ value, onChange }) => {
  return (
    <div className="flex items-center border border-neutral-300 rounded-md overflow-hidden h-8">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="px-3 text-sm hover:bg-neutral-100"
      >
        -
      </button>
      <div className="px-3 text-sm">{value}</div>
      <button
        onClick={() => onChange(value + 1)}
        className="px-3 text-sm hover:bg-neutral-100"
      >
        +
      </button>
    </div>
  );
};

/* Cart Item */
const CartItem = ({ item, onQty, onRemove }) => {
  const unitPrice =
    item.product?.salePrice || item.product?.price || item.price || 0;

  return (
    <div className="py-6 border-b border-neutral-200">
      {/* Mobile: flex-col | Desktop: your original 3-column grid */}
      <div
        className="
        flex flex-col gap-4
        sm:grid sm:grid-cols-[100px_1fr_auto] sm:gap-6 sm:items-start
      "
      >
        {/* Image */}
        <div className="h-24 w-24 rounded-lg overflow-hidden bg-neutral-100 mx-auto sm:mx-0">
          <img
            src={item.product?.img || item.img}
            alt={item.product?.name || item.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="text-sm font-[Montserrat]">
          <div className="font-medium text-neutral-900">
            {item.product?.name || item.name}
          </div>

          {item.size && (
            <div className="text-neutral-500 text-xs mt-1">
              Size: {item.size}
            </div>
          )}

          {item.note && (
            <div className="text-neutral-500 text-xs mt-1">
              Note: {item.note}
            </div>
          )}

          <div className="mt-3 flex items-center gap-4">
            <Qty value={item.qty} onChange={onQty} />
            <button
              className="text-xs text-red-500 hover:opacity-70"
              onClick={onRemove}
            >
              Remove
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="text-right sm:text-right text-sm font-[Montserrat] font-medium text-neutral-900">
          KD {(unitPrice * item.qty).toFixed(3)}
        </div>
      </div>
    </div>
  );
};

/* Summary Card */
const Summary = ({ subtotal, onCheckout }) => (
  <div className="rounded-xl border border-neutral-200 p-6 bg-white shadow-sm">
    <div className="flex items-center justify-between text-sm font-[Montserrat] text-neutral-800">
      <span>Subtotal</span>
      <span className="font-semibold">KD {subtotal.toFixed(3)}</span>
    </div>

    <button
      onClick={onCheckout}
      className="w-full mt-6 py-2.5 rounded-md bg-black text-white text-xs font-[Montserrat] tracking-wide hover:bg-neutral-900 transition"
    >
      CHECKOUT
    </button>
  </div>
);

/* Main Cart Page */
const CartPage = ({ items, setItems, goCheckout, goBack }) => {
  const subtotal = items.reduce((sum, it) => {
    const unitPrice =
      it.product?.salePrice || it.product?.price || it.price || 0;
    return sum + unitPrice * it.qty;
  }, 0);

  const updateQty = (idx, qty) =>
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, qty: Math.max(qty, 1) } : it))
    );

  const removeItem = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  return (
    <main className="pt-8 pb-16 min-h-screen bg-white">
      <Container>
        {/* Back button (same style as AllProducts / ProductDetail) */}
        <button
          onClick={goBack}
          className="mb-6 text-sm text-neutral-600 rounded-full px-4 py-1 hover:bg-neutral-100 transition"
        >
          ← Back
        </button>

        <h1 className="text-xl font-[Montserrat] tracking-wide text-neutral-900">
          YOUR BAG
        </h1>

        {/* Empty State */}
        {items.length === 0 ? (
          <p className="mt-8 text-center text-sm text-neutral-500">
            Your bag is empty.
          </p>
        ) : (
          <div className="mt-8 grid lg:grid-cols-12 gap-10">
            {/* Items */}
            <div className="lg:col-span-8 border border-neutral-200 rounded-xl p-4 bg-white shadow-sm">
              {items.map((item, idx) => (
                <CartItem
                  key={idx}
                  item={item}
                  onQty={(v) => updateQty(idx, v)}
                  onRemove={() => removeItem(idx)}
                />
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <Summary subtotal={subtotal} onCheckout={goCheckout} />
            </div>
          </div>
        )}
      </Container>
    </main>
  );
};

export default CartPage;
