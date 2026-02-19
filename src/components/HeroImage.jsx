// src/components/HeroImage.jsx
import React, { useState } from "react";

export const defaultHero = {};

const HeroImage = ({ image, onShopNow }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative w-full h-[calc(100vh-56px)] overflow-hidden bg-white">
      {/* Loading skeleton/background */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-white animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 via-white to-neutral-100" />
        </div>
      )}

      {/* Hero Image */}
      {image && (
        <img
          src={image}
          alt="Hero"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
      )}

      {/* Overlay - only show when image is loaded */}
      {imageLoaded && <div className="absolute inset-0 bg-black/40" />}
      
      {/* Shop Now Button */}
      <div
        className="
    absolute 
    left-1/2 transform -translate-x-1/2
    bottom-20         /* mobile: move text up */
    sm:bottom-10      /* slightly up on small tablets */
    md:bottom-6       /* desktop normal */
  "
      >
        <button
          onClick={onShopNow}
          className="px-12 py-8 sm:px-12 py-3 text-1xl sm:text-2xl font-reg font-[Montserrat] tracking-wide text-white transition-none"
        >
          SHOP NOW
        </button>
      </div>
    </div>
  );
};

export default HeroImage;
