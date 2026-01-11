import React, { useRef, useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const Carousel = ({ items, renderItem }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setTimeout(() => slider.current?.update(), 150);
  }, [items]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // 🔥 Duplicate items to force looping even if perView === items.length
  const loopItems = [...items, ...items];

  // Dynamic perView based on screen size
  const getPerView = () => {
    const w = window.innerWidth;
    if (w >= 1600) return 5;
    if (w >= 1280) return 4;
    if (w >= 768) return 3;
    return 2;
  };

  const perView = getPerView();

  // Keen slider
  const [sliderRef, slider] = useKeenSlider({
    loop: true, // force looping
    drag: true,
    renderMode: "performance",
    slides: {
      perView: perView,
      spacing: 16,
    },
    breakpoints: {
      "(max-width: 1280px)": {
        slides: { perView: 3, spacing: 16 },
      },
      "(max-width: 768px)": {
        slides: { perView: 2, spacing: 12 },
      },
    },
  });

  // 📱 MOBILE SCROLL VERSION
  if (isMobile) {
    return (
      <div className="flex overflow-x-auto gap-3 px-2 pb-4 no-scrollbar">
        {items.map((item, i) => (
          <div key={i} className="min-w-[70%] max-w-[80%] flex-shrink-0">
            {renderItem(item)}
          </div>
        ))}
      </div>
    );
  }

  // 💻 DESKTOP VERSION
  return (
    <div className="relative w-full">
      <div ref={sliderRef} className="keen-slider">
        {loopItems.map((item, i) => (
          <div key={i} className="keen-slider__slide flex justify-center">
            {renderItem(item)}
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => slider.current?.prev()}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 
                  bg-white/80 hover:bg-white w-9 h-9 rounded-full shadow 
                  items-center justify-center z-10"
      >
        ‹
      </button>

      <button
        onClick={() => slider.current?.next()}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 
                  bg-white/80 hover:bg-white w-9 h-9 rounded-full shadow 
                  items-center justify-center z-10"
      >
        ›
      </button>
    </div>
  );
};

export default Carousel;
