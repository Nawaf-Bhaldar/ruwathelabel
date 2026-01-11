// src/components/ProductDetail.jsx
import React, { useMemo, useState, useEffect } from "react";
import { convertKWD, fmt } from "../utils/currency";
import ChartDialog from "./ChartDialog"; // or correct path if different
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { BASE_URL } from "../config/api";

import {
  extractVariantOptions,
  computeSelectedCombination,
} from "../utils/variant";
import { GetProductById } from "../api/Product";
import { useRef } from "react";

const ProductDetail = ({ product, onBack, currency, onAddToCart }) => {
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [note, setNote] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedCombination, setSelectedCombination] = useState({});
  const [fullProduct, setFullProduct] = useState({
    ...product,
    productOptions: product?.productOptions || [],
  });
  const [loading, setLoading] = useState(false);
  const swiperRef = useRef(null);

  useEffect(() => {
    async function load() {
      if (!product?.id) return;

      // Reset state when product changes
      setSelectedCombination({});
      setSelectedImage(0);

      // Always fetch full product details using GetProductById (like Sera Admin does)
      // This ensures we have complete productOptions data with all stock information
      setLoading(true);
      try {
        const res = await GetProductById(product.id);

        if (res.status === true && res.data) {
          const productOptions = res.data.productOptions || [];
          
          const parsed = {
            ...res.data,
            productOptions: productOptions.map((option) => ({
              ...option,
              productOptionStockItems: option.productOptionStockItems || [],
              stockCombinations: option.stockCombinations
                ? typeof option.stockCombinations === 'string'
                  ? JSON.parse(option.stockCombinations)
                  : option.stockCombinations
                : null,
            })),
          };

          setFullProduct(parsed);
        } else {
          // If API fails but returns data, use what we have
          setFullProduct({
            ...product,
            productOptions: product.productOptions || [],
          });
        }
      } catch (err) {
        console.error("Error loading product:", err);
        // Fallback to product prop if API fails
        setFullProduct({
          ...product,
          productOptions: product.productOptions || [],
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [product?.id]); // Only depend on product.id, not entire product object

  const handleVariantSelection = (optionName, value) => {
    setSelectedCombination((prev) => {
      const updated = { ...prev, [optionName]: value };
      if (prev[optionName] === value) {
        delete updated[optionName];
      }
      return updated;
    });
  };

  const variants = extractVariantOptions(fullProduct);

  // const getVariantOptions = () => {
  //   const variants = [];
  //   if (!fullProduct.productOptions) return variants;

  //   fullProduct.productOptions.forEach((option) => {
  //     if (option.type === "singleSelect") {
  //       const values =
  //         option.productOptionStockItems?.map((i) => i.value) || [];

  //       variants.push({
  //         name: option.name,
  //         values,
  //         stockItems: option.productOptionStockItems || [],
  //         type: "singleSelect",
  //         isStock: option.isStock,
  //       });
  //     } else if (option.type === "linkedGroup") {
  //       (option.subOptions || []).forEach((sub) => {
  //         const values = sub.productOptionStockItems?.map((i) => i.value) || [];

  //         variants.push({
  //           name: sub.name,
  //           values,
  //           stockItems: sub.productOptionStockItems || [],
  //           stockCombinations: option.stockCombinations,
  //           type: "linkedGroup",
  //           linkedGroupId: option.id,
  //         });
  //       });
  //     }
  //   });

  //   return variants;
  // };

  // const getSelectedCombinationData = useMemo(() => {
  //   const variants = getVariantOptions();

  //   if (variants.length === 0) {
  //     return {
  //       isValid: (fullProduct.stockOnHand || 0) > 0,
  //       extraPrice: 0,
  //       quantity: fullProduct.stockOnHand || 0,
  //     };
  //   }

  //   let valid = true;
  //   let extra = 0;
  //   let qty = Infinity;
  //   const processed = new Set();

  //   for (const variant of variants) {
  //     const selectedValue = selectedCombination[variant.name];
  //     if (!selectedValue) continue;

  //     if (variant.type === "singleSelect") {
  //       const item = variant.stockItems.find((s) => s.value === selectedValue);
  //       if (item) {
  //         extra += item.extraPrice || 0;
  //         qty = Math.min(qty, item.quantity);
  //         if (item.quantity === 0) valid = false;
  //       }
  //     }

  //     if (
  //       variant.type === "linkedGroup" &&
  //       !processed.has(variant.linkedGroupId)
  //     ) {
  //       const groupOptions = variants.filter(
  //         (v) => v.linkedGroupId === variant.linkedGroupId
  //       );

  //       const allSelected = groupOptions.every(
  //         (v) => selectedCombination[v.name]
  //       );

  //       if (allSelected) {
  //         const combo = variant.stockCombinations?.find((combo) =>
  //           groupOptions.every((opt) =>
  //             combo.Variants.some(
  //               (v) => v[opt.name] === selectedCombination[opt.name]
  //             )
  //           )
  //         );

  //         if (combo) {
  //           extra += combo.ExtraPrice || 0;
  //           qty = combo.Quantity;
  //           if (combo.Quantity === 0) valid = false;
  //         }
  //         processed.add(variant.linkedGroupId);
  //       }
  //     }
  //   }

  //   return {
  //     isValid: valid,
  //     extraPrice: extra,
  //     quantity: qty === Infinity ? 0 : qty,
  //   };
  // }, [selectedCombination, product]);

  const selectedData = useMemo(
    () => computeSelectedCombination(fullProduct, selectedCombination),
    [fullProduct, selectedCombination]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const nextImage = () => {
    if (!fullProduct.images) return;
    setSelectedImage((prev) =>
      prev === fullProduct.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!fullProduct.images) return;
    setSelectedImage((prev) =>
      prev === 0 ? fullProduct.images.length - 1 : prev - 1
    );
  };

  // Unified price handling (same as AllProducts)
  const productPrice =
    fullProduct.salePrice ??
    fullProduct.price ??
    fullProduct.productPrice ??
    fullProduct.sellingPrice ??
    0;

  const convertedPrice = useMemo(
    () => convertKWD(productPrice, currency),
    [productPrice, currency]
  );

  const prepTime = fullProduct.prepTime ?? "3–5 business days";

  const handleAdd = () => {
    const numericQty = Number(qty) || 1;
    onAddToCart({
      id: fullProduct.id,
      product: fullProduct, // ← FIX
      qty: numericQty,
      selectedCombination,
      note,
      price: productPrice,
    });
  };
  const [chartOpen, setChartOpen] = useState(false);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 pb-24">
        <button
          onClick={onBack}
          className="mb-6 text-sm text-neutral-600 rounded-full px-4 py-1 hover:bg-neutral-100 transition"
        >
          ← Back
        </button>
        <div className="flex items-center justify-center py-20">
          <div className="text-sm text-neutral-500 font-[Montserrat]">
            Loading product...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 pb-24">
      <button
        onClick={onBack}
        className="mb-6 text-sm text-neutral-600 rounded-full px-4 py-1 hover:bg-neutral-100 transition"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Image */}
        {/* Image Gallery */}
        <div className="w-full">
          {/* Main Image */}
          <div className="relative w-full max-h-full overflow-hidden shadow-md rounded">
            {fullProduct.productImages?.length > 0 ? (
              <Swiper
                modules={[Navigation]}
                spaceBetween={10}
                slidesPerView={1}
                navigation={true}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                onSlideChange={(swiper) => setSelectedImage(swiper.activeIndex)}
                initialSlide={selectedImage}
              >
                {fullProduct.productImages.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <img
                      src={BASE_URL + img.imagePath}
                      alt={`Product image ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading={idx === 0 ? "eager" : "lazy"}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/600";
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
                  <img
                    src={fullProduct.img}
                    alt={fullProduct.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/600";
                    }}
                  />
            )}
          </div>

          {/* Thumbnails */}
          {/* Thumbnails UNDER the main slider */}
          {/* Thumbnails */}
          {fullProduct.productImages?.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {fullProduct.productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedImage(index);
                    swiperRef.current?.slideTo(index); // ⭐ GO TO SLIDE
                  }}
                  className={`w-20 h-20 border rounded overflow-hidden ${
                    selectedImage === index
                      ? "border-neutral-900"
                      : "border-neutral-300"
                  }`}
                >
                  <img
                    src={BASE_URL + img.imagePath}
                    alt="thumb"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          {/* Name */}
          <h1 className="text-lg font-[All_Seasons] tracking-wide text-neutral-900">
            {fullProduct.name}
          </h1>

          {/* Price */}
          <p className="text-base -mt-1 text-neutral-900 font-[Montserrat]">
            {fmt(convertedPrice, currency)}
          </p>

          {/* Preparation time */}
          <p className="text-xs text-neutral-600 font-[Montserrat]">
            Preparation time: {prepTime}
          </p>
          <div className="w-full h-[1px] bg-neutral-300 mt-2 mb-2" />

          {/* Options: Size & Color */}
          <div className="flex flex-col gap-4">
            {/* Description */}
            {/* Description */}
            <div>
              <label className="block text-xs font-[Montserrat]">
                Description
              </label>

              <p className="text-sm text-neutral-700 font-[Montserrat] leading-relaxed">
                {fullProduct?.info || fullProduct?.description || ""}
              </p>
            </div>
          </div>

          {variants.map((variant) => (
            <div key={variant.name}>
              <label className="block text-xs font-[Montserrat] mt-4">
                {variant.name}
              </label>

              <div className="flex gap-2 flex-wrap">
                {variant.values.map((value) => {
                  let isAvailable = true;

                  if (variant.type === "singleSelect") {
                    // Check if stock is ON
                    const isStockOn = variant.isStock === true;
                    
                    if (!isStockOn) {
                      // STOCK OFF → all sizes available if main product has stock (ignore per-size quantities)
                      isAvailable = (fullProduct.stockOnHand || 0) > 0;
                    } else {
                      // STOCK ON → only sizes with quantity > 0 are available
                      isAvailable = variant.stockItems.some(
                        (item) => item.value === value && item.quantity > 0
                      );
                    }
                  } else if (variant.type === "linkedGroup") {
                    // For linked groups, check stock combinations
                    isAvailable = variant.stockCombinations?.some(
                      (combo) =>
                        combo.Variants.some(
                          (v) => v[variant.name] === value
                        ) && combo.Quantity > 0
                    );
                  }

                  return (
                    <button
                      key={value}
                      disabled={!isAvailable}
                      onClick={() =>
                        handleVariantSelection(variant.name, value)
                      }
                      className={`px-3 py-1 text-xs border rounded ${
                        selectedCombination[variant.name] === value
                          ? "bg-black text-white border-black"
                          : isAvailable
                          ? "border-neutral-300"
                          : "bg-gray-300 text-white cursor-not-allowed"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Qty */}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-sm font-[Montserrat]">Qty:</span>
            <input
              type="text"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-8 py-1 text-xs text-center border border-neutral-300 text-sm"
            />
          </div>

          {/* Note / Special request */}
          <div className="mt-4">
            <label className="block text-xs font-[Montserrat] mb-1">
              Note:
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for your order..."
              className="w-full max-w-md h-[90px] border border-neutral-300 p-2 text-sm font-[Montserrat] resize-none focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>
        </div>
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white/95 backdrop-blur-sm z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={handleAdd}
            disabled={
              variants.length > 0 &&
              Object.keys(selectedCombination).length !== variants.length
            }
            className={`flex-1 sm:flex-[4] inline-flex items-center justify-center px-6 py-2 text-xs font-[Montserrat] tracking-wide text-white transition
    ${
      variants.length > 0 &&
      Object.keys(selectedCombination).length !== variants.length
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-black hover:bg-neutral-900"
    }
  `}
          >
            ADD TO BAG
          </button>

          <button
            onClick={() => setChartOpen(true)}
            className="flex-1 sm:flex-[1] inline-flex items-center justify-center px-6 py-2 text-xs font-[Montserrat] border border-neutral-400 text-neutral-700 hover:bg-neutral-100 transition"
          >
            SIZE CHART
          </button>
        </div>
      </div>
      <ChartDialog
        isOpen={chartOpen}
        onClose={() => setChartOpen(false)}
        chartSize={fullProduct.chartSize}
      />
    </div>
  );
};

export default ProductDetail;
