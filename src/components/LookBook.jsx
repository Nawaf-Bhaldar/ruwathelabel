import React from "react";

const LookBook = ({ text = "LOOK BOOK", className = "" }) => (
  <div
    className={`text-[#030303] text-[14px] font-[500] font-[All_Seasons] tracking-[1px] mb-[20px] ${className}`}
  >
    {text}
  </div>
);

export default LookBook;
