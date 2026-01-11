// src/components/AllProducts.jsx
import React, { useMemo, useState, useEffect } from "react";
import { convertKWD, fmt } from "../utils/currency";
import { GetProductsByCollectionId } from "../api/Product";
import { BASE_URL } from "../config/api";

const AllProducts = ({ items, onBack, onOpenProduct, currency, collections = [], collectionId = null }) => {
  const [q, setQ] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [category, setCategory] = useState("");
  const [activeTab, setActiveTab] = useState(collectionId ? "collections" : "products");
  const [selectedCollectionId, setSelectedCollectionId] = useState(collectionId);
  const [collectionProducts, setCollectionProducts] = useState([]);
  const [loadingCollectionProducts, setLoadingCollectionProducts] = useState(false);
  const useM = useMemo;

  const sizes = useM(
    () => Array.from(new Set(items.flatMap((i) => i.sizes || []))),
    [items]
  );
  const colors = useM(
    () => Array.from(new Set(items.flatMap((i) => i.colors || []))),
    [items]
  );
  const categories = useM(
    () => Array.from(new Set(items.map((i) => i.category).filter(Boolean))),
    [items]
  );

  // Fetch products for selected collection
  useEffect(() => {
    if (selectedCollectionId) {
      setLoadingCollectionProducts(true);
      async function fetchCollectionProducts() {
        try {
          const res = await GetProductsByCollectionId(selectedCollectionId);
          if (res.status && Array.isArray(res.data)) {
            const mapped = res.data.map((p) => ({
              ...p,
              img: p.productImages?.[0]?.imagePath
                ? p.productImages[0].imagePath.startsWith("http")
                  ? p.productImages[0].imagePath
                  : BASE_URL + p.productImages[0].imagePath
                : "https://via.placeholder.com/300",
            }));
            setCollectionProducts(mapped);
          } else {
            setCollectionProducts([]);
          }
        } catch (err) {
          console.error("Error fetching collection products:", err);
          setCollectionProducts([]);
        } finally {
          setLoadingCollectionProducts(false);
        }
      }
      fetchCollectionProducts();
    } else {
      setCollectionProducts([]);
    }
  }, [selectedCollectionId]);

  // Set initial state if collectionId prop is provided
  useEffect(() => {
    if (collectionId) {
      setSelectedCollectionId(collectionId);
      setActiveTab("collections");
    }
  }, [collectionId]);

  const filtered = useM(
    () => {
      const itemsToFilter = selectedCollectionId ? collectionProducts : items;
      return itemsToFilter.filter((i) => {
        const matchQ = q
          ? i.name.toLowerCase().includes(q.toLowerCase()) ||
            i.description?.toLowerCase().includes(q.toLowerCase())
          : true;
        const matchSize = size ? (i.sizes || []).includes(size) : true;
        const matchColor = color ? (i.colors || []).includes(color) : true;
        const matchCat = category ? i.category === category : true;
        return matchQ && matchSize && matchColor && matchCat;
      });
    },
    [selectedCollectionId ? collectionProducts : items, q, size, color, category, selectedCollectionId]
  );

  const handleCollectionClick = (collection) => {
    setSelectedCollectionId(collection.id);
    setActiveTab("collections");
  };

  const handleBackToCollections = () => {
    setSelectedCollectionId(null);
    setActiveTab("collections");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={selectedCollectionId ? handleBackToCollections : onBack}
          className="mb-6 text-sm text-neutral-600 rounded-full px-4 py-1 hover:bg-neutral-100 transition"
        >
          ← Back
        </button>
        <h1 className="text-base font-[All_Seasons] tracking-wide">
          {selectedCollectionId 
            ? collections.find(c => c.id === selectedCollectionId)?.name || "Collection"
            : "All Products"}
        </h1>
        <div className="w-20" />
      </div>

      {/* Tabs */}
      {!selectedCollectionId && (
        <div className="flex gap-4 mb-6 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-2 px-1 text-sm font-[Montserrat] transition ${
              activeTab === "products"
                ? "border-b-2 border-neutral-900 text-neutral-900 font-medium"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setActiveTab("collections")}
            className={`pb-2 px-1 text-sm font-[Montserrat] transition ${
              activeTab === "collections"
                ? "border-b-2 border-neutral-900 text-neutral-900 font-medium"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Collections
          </button>
        </div>
      )}

      {/* Search & filters */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products..."
          className="sm:col-span-2 border border-neutral-300 px-3 py-2 text-sm font-[Montserrat] focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-neutral-300 px-3 py-2 text-sm font-[Montserrat] focus:outline-none focus:ring-1 focus:ring-neutral-400"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c || ""} value={c || ""}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="border border-neutral-300 px-3 py-2 text-sm font-[Montserrat] focus:outline-none focus:ring-1 focus:ring-neutral-400"
        >
          <option value="">All colors</option>
          {colors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div> */}

      {/* Size filter pills */}
      {/* <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-sm text-neutral-700 font-[Montserrat] mr-2">
          Filter by size:
        </span>
        <button
          onClick={() => setSize("")}
          className={`px-3 py-1 text-xs border font-[Montserrat] ${
            size === ""
              ? "bg-neutral-900 text-white border-neutral-900"
              : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          All
        </button>
        {sizes.map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            className={`px-3 py-1 text-xs border font-[Montserrat] ${
              size === s
                ? "bg-neutral-900 text-white border-neutral-900"
                : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {s}
          </button>
        ))}
      </div> */}

      {/* Show collections or products based on active tab */}
      {!selectedCollectionId && activeTab === "collections" ? (
        /* Collections grid */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {collections.map((c) => (
            <div key={c.id}>
              <div
                onClick={() => handleCollectionClick(c)}
                className="relative w-full sm:w-[235px] h-[300px] sm:h-[380px] overflow-hidden shadow-sm hover:shadow-lg cursor-pointer"
              >
                <img
                  src={c.img}
                  alt={c.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300";
                  }}
                />
              </div>

              <div className="mt-2 w-full sm:w-[235px]">
                <span className="text-neutral-800 font-[Montserrat] text-sm">
                  {c.name}
                </span>
              </div>
            </div>
          ))}
          {collections.length === 0 && (
            <div className="col-span-full text-center text-sm text-neutral-500 font-[Montserrat] py-10">
              No collections available.
            </div>
          )}
        </div>
      ) : (
        /* Products grid */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {loadingCollectionProducts ? (
            <div className="col-span-full text-center text-sm text-neutral-500 font-[Montserrat] py-10">
              Loading products...
            </div>
          ) : (
            <>
              {filtered.map((p) => (
                <div key={p.id}>
              <div
                onClick={() => onOpenProduct(p)}
                className="relative w-full sm:w-[235px] h-[300px] sm:h-[380px] overflow-hidden shadow-sm hover:shadow-lg cursor-pointer"
              >
                <img
                  src={p.img}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300";
                  }}
                />
              </div>

                  <div className="mt-2 w-full sm:w-[235px] flex justify-between text-sm">
                    <span className="text-neutral-800 font-[Montserrat]">
                      {p.name}
                    </span>
                    <span className="text-neutral-500 font-[Montserrat]">
                      {fmt(
                        convertKWD(p.salePrice || p.price || 0, currency),
                        currency
                      )}
                    </span>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center text-sm text-neutral-500 font-[Montserrat] py-10">
                  {selectedCollectionId 
                    ? "No products in this collection."
                    : "No products match your filters."}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AllProducts;
