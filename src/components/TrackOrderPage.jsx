import React, { useState, useEffect } from "react";
import { BASE_URL } from "../config/api";
import { GetOrderByInvoiceId } from "../api/Order";

const TrackOrderPage = ({ onBack }) => {
  const [orderNumber, setOrderNumber] = useState("");
  const [tracking, setTracking] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  // Load orderData from localStorage on mount to prevent scroll reset
  useEffect(() => {
    const savedOrderData = localStorage.getItem("ruwa-track-order-data");
    const savedOrderNumber = localStorage.getItem("ruwa-track-order-number");
    if (savedOrderData) {
      try {
        const parsed = JSON.parse(savedOrderData);
        setOrderData(parsed);
      } catch (err) {
        console.error("Error loading saved order data:", err);
      }
    }
    if (savedOrderNumber) {
      setOrderNumber(savedOrderNumber);
    }
  }, []);

  // Save orderData to localStorage whenever it changes
  useEffect(() => {
    if (orderData) {
      localStorage.setItem("ruwa-track-order-data", JSON.stringify(orderData));
    } else {
      localStorage.removeItem("ruwa-track-order-data");
    }
  }, [orderData]);

  // Save orderNumber to localStorage
  useEffect(() => {
    if (orderNumber) {
      localStorage.setItem("ruwa-track-order-number", orderNumber);
    } else {
      localStorage.removeItem("ruwa-track-order-number");
    }
  }, [orderNumber]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateString);
        return "N/A";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (err) {
      console.warn("Date formatting error:", err, dateString);
      return "N/A";
    }
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const transformOrderData = (order, searchValue) => {
    const currentStatusId = order.statusId || order.StatusId || order.Status?.Id || 7;
    const currentStatusName = order.status?.name || order.Status?.Name || "Unknown";

    const cancelledStatusIds = [5, 8];
    const isCancelled = cancelledStatusIds.includes(currentStatusId);

    const allStatusSteps = [
      { id: 7, name: "Payment Due" },
      { id: 1, name: "Preparing" },
      { id: 3, name: "Out for Delivery" },
      { id: 4, name: "Delivered" },
    ];

    const orderTimelines = order.orderTimelines || order.OrderTimelines || [];
    const timelines = orderTimelines.map((tl) => ({
      statusId: tl.statusId || tl.StatusId,
      statusName: tl.status?.name || tl.Status?.Name || `Status ${tl.statusId || tl.StatusId}`,
      createdDate: tl.createdDate || tl.CreatedDate,
    }));

    const reachedStatusIds = new Set();
    timelines.forEach((tl) => {
      if (tl.statusId) {
        reachedStatusIds.add(tl.statusId);
      }
    });
    reachedStatusIds.add(currentStatusId);

    const timelineSteps = [];

    for (const step of allStatusSteps) {
      const isReached = reachedStatusIds.has(step.id);
      const isCurrent = step.id === currentStatusId;
      const isCompleted = isReached && !isCurrent;

      const timelineEntry = timelines.find((tl) => tl.statusId === step.id);
      const stepDate = timelineEntry
        ? formatShortDate(timelineEntry.createdDate)
        : isReached
          ? formatShortDate(order.createdDate || order.CreatedDate)
          : "";

      timelineSteps.push({
        status: step.name,
        date: stepDate,
        completed: isCompleted,
        isCurrent: isCurrent,
        isReached: isReached,
      });
    }

    if (isCancelled && !timelines.some((tl) => cancelledStatusIds.includes(tl.statusId))) {
      const cancelledStatusName = currentStatusId === 5 ? "Cancelled" : "Refunded";
      timelineSteps.push({
        status: cancelledStatusName,
        date: formatShortDate(order.createdDate || order.CreatedDate),
        completed: true,
        isCurrent: false,
        isReached: true,
      });
    }

    if (timelineSteps.length === 0) {
      timelineSteps.push({
        status: currentStatusName,
        date: "",
        completed: false,
        isCurrent: true,
        isReached: true,
      });
    }

    const orderItems = order.orderItems || order.OrderItems || [];
    const items = orderItems.map((item) => ({
      name: item.product?.name || item.Product?.Name || "Product",
      quantity: item.quantity || item.Quantity || 1,
      price: item.unitPrice || item.UnitPrice || item.total || item.Total || 0,
      image:
        item.product?.productImages?.[0]?.imagePath || item.Product?.ProductImages?.[0]?.imagePath
          ? (item.product?.productImages?.[0]?.imagePath || item.Product?.ProductImages?.[0]?.imagePath).startsWith("http")
            ? (item.product?.productImages?.[0]?.imagePath || item.Product?.ProductImages?.[0]?.imagePath)
            : BASE_URL + (item.product?.productImages?.[0]?.imagePath || item.Product?.ProductImages?.[0]?.imagePath)
          : "",
    }));

    return {
      orderNumber: order.invoiceId || order.InvoiceId || order.id?.toString() || order.Id?.toString() || searchValue,
      status: currentStatusName,
      timeline: timelineSteps,
      items: items,
      total: order.amount || order.Amount || 0,
    };
  };

  const handleTrack = async () => {
    if (!orderNumber.trim()) return;

    setTracking(true);
    setError(null);

    try {
      const searchValue = orderNumber.trim();
      
      // Only use GetOrderByInvoiceId
      const response = await GetOrderByInvoiceId(searchValue);
      
      if (response.status === true && response.data) {
        const transformedData = transformOrderData(response.data, searchValue);
        setOrderData(transformedData);
      } else {
        setOrderData(null);
        setError("Order not found. Please check your invoice ID.");
      }
    } catch (err) {
      console.error("Error tracking order:", err);
      setOrderData(null);
      setError("An error occurred while tracking your order. Please try again.");
    } finally {
      setTracking(false);
    }
  };

  const handleBack = () => {
    localStorage.removeItem("ruwa-track-order-data");
    localStorage.removeItem("ruwa-track-order-number");
    onBack();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "14px",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>

        {/* Title */}
        <h1
          className="text-center mb-8"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "18px",
            fontWeight: 500,
            color: "#030303",
            letterSpacing: "1px",
          }}
        >
          TRACK MY ORDER
        </h1>

        {/* Search Input */}
        <div className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter your invoice ID"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="flex-1 px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500 transition-colors"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "14px",
                fontWeight: 300,
              }}
              onKeyPress={(e) => e.key === "Enter" && handleTrack()}
            />
            <button
              onClick={handleTrack}
              disabled={tracking || !orderNumber.trim()}
              className="px-6 py-3 border border-neutral-900 rounded-md text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "12px",
                fontWeight: 300,
                letterSpacing: "1px",
              }}
            >
              {tracking ? "Tracking..." : "Track"}
            </button>
          </div>
          <p
            className="mt-2"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "10px",
              color: "#6b7280",
              fontWeight: 300,
            }}
          >
            Enter your Invoice ID from the confirmation email
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md">
            <p
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "14px",
                color: "#dc2626",
                fontWeight: 300,
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Order Data */}
        {orderData && (
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="border border-neutral-300 rounded-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "#030303",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Order #{orderData.orderNumber}
                  </h2>
                </div>
                <div className="text-right">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-neutral-900"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <span
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#030303",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                      }}
                    >
                      {orderData.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="border border-neutral-300 rounded-md p-6">
              <h3
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#030303",
                  marginBottom: "24px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Order Timeline
              </h3>
              <div className="space-y-0">
                {orderData.timeline.map((step, index) => {
                  const isCompleted = step.completed === true;
                  const isCurrent = step.isCurrent === true;
                  const isReached = step.isReached === true;
                  const showConnector = index < orderData.timeline.length - 1;
                  const isGreyed = !isReached && !isCurrent && !isCompleted;

                  return (
                    <div key={index} className="flex gap-4 relative">
                      <div className="flex flex-col items-center relative">
                        {showConnector && (
                          <div
                            className={`w-0.5 absolute top-10 left-1/2 transform -translate-x-1/2 z-0 ${
                              isCompleted || isCurrent
                                ? "bg-neutral-900"
                                : isGreyed
                                  ? "bg-neutral-200"
                                  : "bg-neutral-300"
                            }`}
                            style={{ height: "calc(100% - 40px)", minHeight: "48px" }}
                          />
                        )}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 border-2 ${
                            isCompleted
                              ? "bg-neutral-900 border-neutral-900"
                              : isCurrent
                                ? "bg-white border-neutral-900"
                                : isGreyed
                                  ? "bg-white border-neutral-200"
                                  : "bg-white border-neutral-300"
                          }`}
                        >
                          {isCompleted ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke={isCurrent ? "#030303" : isGreyed ? "#d1d5db" : "#9ca3af"}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 py-4">
                        <p
                          style={{
                            fontFamily: "Montserrat, sans-serif",
                            fontSize: "14px",
                            fontWeight: isCurrent ? 500 : 300,
                            color: isGreyed
                              ? "#9ca3af"
                              : isCompleted || isCurrent
                                ? "#030303"
                                : "#6b7280",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          {step.status}
                          {isCurrent && (
                            <span className="ml-2 text-neutral-600 text-xs normal-case">(Current)</span>
                          )}
                        </p>
                        {step.date && (
                          <p
                            style={{
                              fontFamily: "Montserrat, sans-serif",
                              fontSize: "12px",
                              color: isGreyed ? "#d1d5db" : "#6b7280",
                              fontWeight: 300,
                              marginTop: "4px",
                            }}
                          >
                            {step.date}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="border border-neutral-300 rounded-md p-6">
              <h3
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#030303",
                  marginBottom: "16px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Order Items
              </h3>
              <div className="space-y-4">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-20 h-24 bg-neutral-100 rounded-md overflow-hidden border border-neutral-300">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#030303",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {item.name}
                      </p>
                      <p
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: 300,
                          marginTop: "4px",
                        }}
                      >
                        Quantity: {item.quantity}
                      </p>
                      <p
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#030303",
                          marginTop: "8px",
                        }}
                      >
                        {item.price.toFixed(3)} KWD
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-300 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <p
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "#030303",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Total
                  </p>
                  <p
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "#030303",
                    }}
                  >
                    {orderData.total.toFixed(3)} KWD
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!orderData && !tracking && (
          <div className="text-center py-16 border border-neutral-300 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <p
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "14px",
                color: "#6b7280",
                fontWeight: 300,
              }}
            >
              Enter your order number above to track your package
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;

