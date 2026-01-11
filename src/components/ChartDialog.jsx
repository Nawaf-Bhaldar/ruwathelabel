// src/components/ChartDialog.jsx
import React from "react";
import { BASE_URL } from "/src/config/api.js";

import Dialog from "./Dialog";

const ChartDialog = ({ isOpen, onClose, chartSize }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Size Chart</h2>

        {chartSize ? (
          <img
            src={BASE_URL + chartSize}
            alt="Size Chart"
            className="mx-auto max-h-[500px] rounded-lg"
          />
        ) : (
          <p className="text-center text-gray-500">No size chart available</p>
        )}

        <div className="flex justify-end mt-5">
          <button
            className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ChartDialog;
