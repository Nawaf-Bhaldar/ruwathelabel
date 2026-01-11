import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./index.css";
import { GetAllProductsByUserId } from "./api/Product";
import { USER_ID, BASE_URL } from "./config/api";

import HeroImage, { defaultHero } from "./components/HeroImage";
import BestSellerTitle from "./components/LookBook";
import Carousel from "./components/Carousel";
import ProductCard from "./components/ProductCard";
import ProductDetail from "./components/ProductDetail";
import AllProducts from "./components/AllProducts";
import NewArrivalCover, {
  defaultNewArrival,
} from "./components/NewArrivalCover";
import { apiGetAllCollectionsById } from "./api/Collection";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import PayNowPage from "./components/PayNowPage";
import OrderConfirmationPage from "./components/OrderConfirmationPage";
import { getStockItemIds } from "./utils/variant";

export default function RuwaTheLabel() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [page, setPage] = useState("home"); // "home" | "all" | "collection"
  const [currency] = useState("KWD");
  const [cartItems, setCartItems] = useState([]); // stored but no checkout page yet
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [currentCollectionId, setCurrentCollectionId] = useState(null);

  const heroImg = collections[0]?.img || defaultHero.image;
  const newArrivalImg =
    collections && collections.length > 0
      ? collections[1].img
      : defaultNewArrival.image;

  // const openCollection = (id, name) => {
  //   setSelectedProduct(null);
  //   setPage("collection");
  //   // store collection id and name
  //   setCurrentCollection({ id, name });
  // };

  // const [currentCollection, setCurrentCollection] = useState(null);

  // 1️⃣ Load cart from localStorage on first load
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // 2️⃣ Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  React.useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await apiGetAllCollectionsById(USER_ID);

        if (res.status && Array.isArray(res.data)) {
          const mapped = res.data.map((c) => ({
            ...c,
            img: c.imageUrl?.startsWith("http")
              ? c.imageUrl
              : BASE_URL + c.imageUrl,
          }));

          setCollections(mapped);
        } else {
          setCollections([]);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
        setCollections([]);
      }

      setLoadingCollections(false);
    }

    fetchCollections();
  }, []);

  React.useEffect(() => {
    async function fetchProducts() {
      setLoadingProducts(true);

      const res = await GetAllProductsByUserId(USER_ID);

      if (res.status && Array.isArray(res.data)) {
        const mapped = res.data.map((p) => ({
          ...p,
          img: p.productImages?.[0]?.imagePath
            ? p.productImages[0].imagePath.startsWith("http")
              ? p.productImages[0].imagePath
              : BASE_URL + p.productImages[0].imagePath
            : "https://via.placeholder.com/300",
        }));

        setProducts(mapped);
      } else {
        setProducts([]);
      }

      setLoadingProducts(false);
    }

    fetchProducts();
  }, []);

  const goHome = () => {
    setSelectedProduct(null);
    setPage("home");
  };

  const goAll = () => {
    setSelectedProduct(null);
    setCurrentCollectionId(null);
    setPage("all");
  };

  const goToCollection = (collectionId) => {
    setSelectedProduct(null);
    setCurrentCollectionId(collectionId);
    setPage("all");
  };

  const handleAddToCart = (item) => {
    console.log("🔍 ADD TO CART INPUT ITEM1:", item);

    const product = item.product;

    const stockItemIds = getStockItemIds(product, item.selectedCombination);
    console.log(
      "🧪 Option Names in product:",
      product.productOptions.map((o) => o.name)
    );
    console.log(
      "🧪 Selected combination keys:",
      Object.keys(item.selectedCombination)
    );
    console.log("🔍 RAW selectedCombination:", item.selectedCombination);

    console.log("🧪 Variant Stock Item IDs:", stockItemIds);

    const enriched = {
      id: item.id,
      title: product?.name || "",
      price:
        product?.salePrice ||
        product?.price ||
        product?.productPrice ||
        product?.sellingPrice ||
        0,
      qty: item.qty || 1,
      size:
        item.selectedCombination?.Size ||
        item.selectedCombination?.size ||
        "Default",
      img: product?.productImages?.[0]?.imagePath
        ? product.productImages[0].imagePath.startsWith("http")
          ? product.productImages[0].imagePath
          : BASE_URL + product.productImages[0].imagePath
        : "https://via.placeholder.com/300",
      selectedCombination: item.selectedCombination, // keep this
      productOptionStockItemIds: stockItemIds,
    };

    const updated = [...cartItems, enriched];

    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    // important to refresh UI
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <button
              aria-label="Open menu"
              className="p-2 -ml-2 hover:bg-neutral-100 active:scale-95 transition"
              onClick={() => setIsMenuOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="w-7 h-7"
              >
                <line x1="2" y1="8" x2="22" y2="8" strokeLinecap="round" />
                <line x1="2" y1="16" x2="22" y2="16" strokeLinecap="round" />
              </svg>
            </button>

            <button
              onClick={goHome}
              className="font-the-seasons tracking-wider text-2xl sm:text-2xl"
            >
              RUWA THE LABEL
            </button>

            <div className="flex items-center gap-4">
              {/* Cart Icon (no checkout page yet) */}
              <button
                aria-label="Cart"
                className="p-2 hover:bg-neutral-100 active:scale-95 transition relative"
                onClick={() => {
                  setSelectedProduct(null);
                  setPage("cart");
                }}
              >
                <div
                  className="border border-neutral-900 rounded px-3 py-1 text-[12px] font-light tracking-wide"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 300,
                    borderWidth: "1px",
                  }}
                >
                  {cartItems.reduce(
                    (total, item) => total + (item.qty || 1),
                    0
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Side menu overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* TOP SECTION */}
            <div className="p-5 space-y-4 text-sm font-[Montserrat]">
              {/* All Products */}
              <button
                className="w-full text-left hover:text-black uppercase"
                onClick={() => {
                  setIsMenuOpen(false);
                  goAll();
                }}
              >
                All Products
              </button>

              {/* Dynamic Collections */}
              {collections.map((c) => (
                <button
                  key={c.id}
                  className="w-full text-left text-neutral-700 hover:text-black uppercase"
                  onClick={() => {
                    setIsMenuOpen(false);
                    goToCollection(c.id);
                  }}
                >
                  {c.name}
                </button>
              ))}

              {/* ⭐ Move "Track my order" here */}
              <button className="w-full text-left text-neutral-700 hover:text-black uppercase ">
                Track my order
              </button>
            </div>

            {/* BOTTOM SECTION */}
            <div className="border-t border-neutral-200 p-5 space-y-3 text-xs font-[Montserrat] text-neutral-700">
              <div className="flex gap-6 mt-3 sm:mt-0">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/ruwathelabel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="size-5"
                  >
                    <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zm-5 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm4.5-2.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/96500000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="size-5"
                  >
                    <path d="M20.52 3.48A11.8 11.8 0 0 0 12.04 0C5.61 0 .4 5.22.4 11.64c0 2.05.54 4.05 1.57 5.82L0 24l6.7-1.96a11.56 11.56 0 0 0 5.34 1.32h.01c6.43 0 11.64-5.22 11.64-11.64 0-3.11-1.21-6.03-3.17-8.24zM12.05 21.3c-1.64 0-3.25-.44-4.66-1.28l-.33-.2-3.98 1.17 1.17-3.88-.22-.36a9.67 9.67 0 0 1-1.46-5.11c0-5.36 4.36-9.72 9.72-9.72 2.6 0 5.04 1.01 6.88 2.85a9.64 9.64 0 0 1 2.84 6.86c0 5.36-4.36 9.72-9.72 9.72zm5.52-7.27c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.67-2.06-.17-.3-.02-.47.13-.62.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5-.17 0-.37-.02-.57-.02-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.52 0 1.48 1.08 2.91 1.23 3.11.15.2 2.12 3.23 5.14 4.52.72.31 1.29.5 1.73.64.73.23 1.4.2 1.93.12.59-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
                  </svg>
                </a>
              </div>
              {/* <button className="w-full text-left hover:text-black uppercase">
                Track my order
              </button> */}
              <button className="w-full text-left hover:text-black uppercase">
                Privacy &amp; Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Routing (no checkout page) */}
      <div className="flex-1">
        {selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={page === "all" ? () => setSelectedProduct(null) : goHome}
            currency={currency}
            onAddToCart={handleAddToCart}
          />
        ) : page === "all" ? (
          <AllProducts
            items={products}
            onBack={goHome}
            onOpenProduct={(p) => setSelectedProduct(p)}
            currency={currency}
            collections={collections}
            collectionId={currentCollectionId}
          />
        ) : page === "cart" ? (
          <CartPage
            items={cartItems}
            setItems={setCartItems}
            goCheckout={() => setPage("checkout")}
            goBack={goHome}
          />
        ) : page === "checkout" ? (
          <CheckoutPage
            items={cartItems}
            subtotal={cartItems.reduce(
              (sum, it) => sum + (it.product?.price || it.price) * it.qty,
              0
            )}
            setPage={setPage}
            goBack={() => setPage("cart")}
          />
        ) : page === "paynow" ? (
          <PayNowPage setPage={setPage} />
        ) : page === "orderconfirmation" ? (
          <OrderConfirmationPage setPage={setPage} />
        ) : (
          <>
            {/* HOME PAGE */}
            <section className="w-full">
              <HeroImage image={heroImg} onShopNow={goAll} />
            </section>

            <section className="w-full px-4 sm:px-6 pt-14 mb-[-20px]">
              <BestSellerTitle text="LOOK BOOK" className="-mt-4" />

              <Carousel
                items={products}
                renderItem={(p) => (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ProductCard
                      product={p}
                      onClick={() => setSelectedProduct(p)}
                      currency={currency}
                    />
                  </motion.div>
                )}
              />
            </section>

            <section className="max-w-auto mx-auto">
              <NewArrivalCover image={newArrivalImg} onNewArrival={goAll} />
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-200 py-6 text-[12px] text-neutral-600 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6">
        <span>
          © 2025 Ruwa The Label /{" "}
          <a
            href="https://www.mysera.co"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900"
          >
            Sera Fashion Platform
          </a>
        </span>

        <div className="flex gap-6 mt-3 sm:mt-0">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/ruwathelabel"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="size-5"
            >
              <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zm-5 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm4.5-2.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z" />
            </svg>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/96500000000"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="size-5"
            >
              <path d="M20.52 3.48A11.8 11.8 0 0 0 12.04 0C5.61 0 .4 5.22.4 11.64c0 2.05.54 4.05 1.57 5.82L0 24l6.7-1.96a11.56 11.56 0 0 0 5.34 1.32h.01c6.43 0 11.64-5.22 11.64-11.64 0-3.11-1.21-6.03-3.17-8.24zM12.05 21.3c-1.64 0-3.25-.44-4.66-1.28l-.33-.2-3.98 1.17 1.17-3.88-.22-.36a9.67 9.67 0 0 1-1.46-5.11c0-5.36 4.36-9.72 9.72-9.72 2.6 0 5.04 1.01 6.88 2.85a9.64 9.64 0 0 1 2.84 6.86c0 5.36-4.36 9.72-9.72 9.72zm5.52-7.27c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.67-2.06-.17-.3-.02-.47.13-.62.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5-.17 0-.37-.02-.57-.02-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.52 0 1.48 1.08 2.91 1.23 3.11.15.2 2.12 3.23 5.14 4.52.72.31 1.29.5 1.73.64.73.23 1.4.2 1.93.12.59-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
