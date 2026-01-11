import React from "react";

const SizeChartModal = ({ open, onClose }) => {
  if (!open) return null;

  const rows = [
    { s: "XS", b: "76-80", w: "58-62", h: "84-88" },
    { s: "S", b: "81-85", w: "63-67", h: "89-93" },
    { s: "M", b: "86-90", w: "68-72", h: "94-98" },
    { s: "L", b: "91-97", w: "73-79", h: "99-105" },
    { s: "XL", b: "98-104", w: "80-86", h: "106-112" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl border border-gray-200 w-[min(92vw,720px)] p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Size Chart</div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900"
          >
            ✕
          </button>
        </div>
        <div className="mt-4 text-sm text-gray-600 overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead className="text-gray-500 text-xs">
              <tr>
                <th className="pr-4">Size</th>
                <th className="pr-4">Bust (cm)</th>
                <th className="pr-4">Waist (cm)</th>
                <th>Hips (cm)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.s} className="bg-gray-50">
                  <td className="px-3 py-2 rounded-l-lg border border-gray-200">
                    {r.s}
                  </td>
                  <td className="px-3 py-2 border-t border-b border-gray-200">
                    {r.b}
                  </td>
                  <td className="px-3 py-2 border-t border-b border-gray-200">
                    {r.w}
                  </td>
                  <td className="px-3 py-2 rounded-r-lg border border-gray-200">
                    {r.h}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;
