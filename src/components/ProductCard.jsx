// src/components/ProductCard.jsx
import React from "react";

const ProductCard = ({ product, onClick }) => (
  <div className="flex flex-col items-start">
    <div
      onClick={onClick}
      className="relative w-[235px] h-[380px] overflow-hidden transform transition duration-500 hover:scale-105 shadow-sm hover:shadow-lg cursor-pointer"
    >
      <img
        src={product.img}
        alt={product.name}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/300";
        }}
      />
    </div>
    <div className="mt-2 w-[235px] text-center text-sm">
      <span className="text-neutral-800 font-[Montserrat]">{product.name}</span>
    </div>
  </div>
);

export default ProductCard;
