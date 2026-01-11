// src/components/NewArrivalCover.jsx
import React from "react";

export const defaultNewArrival = {};

const NewArrivalCover = ({ image, onNewArrival }) => (
  <div className="relative w-full h-screen overflow-hidden ml-0 border border-[#e5e5e5] mt-[54px]">
    <img
      src={image ?? defaultNewArrival.image}
      alt="New Arrival"
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-black/40" />
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
      <button
        onClick={onNewArrival}
        className="px-12 py-3 text 1xl sm:text-4xl font-reg font-[Montserrat] tracking-wide text-white transition-none"
      >
        NEW ARRIVAL
      </button>
    </div>
  </div>
);

export default NewArrivalCover;
