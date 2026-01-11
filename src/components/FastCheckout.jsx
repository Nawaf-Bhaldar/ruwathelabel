import React, { useState, useRef } from "react";
import {
  apiGetCustomersByPhone,
  sendOtpViaInfobip,
} from "../services/CustomerServices";
import { countryCodes } from "/src/config/api.js";

/* Toast */
const showToast = (message, type = "info") => {
  const bg =
    type === "success"
      ? "bg-green-600"
      : type === "danger"
      ? "bg-red-500"
      : "bg-neutral-900";

  const toast = document.createElement("div");
  toast.innerText = message;
  toast.className = `fixed bottom-4 right-4 text-white px-4 py-2 rounded shadow text-sm z-[9999] ${bg}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
};

/* Dialog */
const Dialog = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl px-4 py-6 w-[92%] max-w-[380px] sm:px-6 relative shadow">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-neutral-500 hover:text-black text-xl"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

/* Fast Checkout Component */
const FastCheckout = ({ setFastCheckout, setUserVerified, userVerified }) => {
  const [phoneCode, setPhoneCode] = useState("+965");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const inputRefs = useRef([]);

  /* Send OTP */
  const sendOtp = async () => {
    if (!phone) {
      showToast("Enter valid phone number", "danger");
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    try {
      await sendOtpViaInfobip(`${phoneCode}${phone}`, code);
      setOtpSent(true);
      setDialogOpen(true);
      showToast("OTP sent successfully!", "success");
    } catch {
      showToast("Failed to send OTP", "danger");
    }
  };

  /* Verify OTP */
  const verifyOtp = async () => {
    const entered = otp.join("");

    if (entered !== generatedOtp) {
      showToast("Invalid OTP", "danger");
      return;
    }

    showToast("Phone verified!", "success");
    setUserVerified(true);

    const res = await apiGetCustomersByPhone(phone);

    if (res.data) {
      const addr = res.data.appUserAddresses?.[0];

      const saved = {
        appUserId: res.data.id,
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        CountryCode: res.data.countryCode || "+965",
        mobile: res.data.phoneNumber || "",
        email: res.data.email || "",
        addressId: addr?.id ?? 0,
        country: addr?.country || "Kuwait",
        state: addr?.state || "",
        city: addr?.city || "",
        addressType: addr?.addressType || "",
        block: addr?.address2 || "",
        street: addr?.address1 || "",
        house: addr?.houseNumber || "",
        zip: addr?.zipCode || "",
      };

      localStorage.setItem("CustomerInfo", JSON.stringify(saved));
      setFastCheckout(true);
    } else {
      const saved = {
        firstName: "",
        lastName: "",
        CountryCode: phoneCode,
        mobile: phone,
        email: "",
        addressId: 0,
        country: "Kuwait",
        state: "",
        city: "",
        addressType: "",
        block: "",
        street: "",
        house: "",
        zip: "",
      };

      localStorage.setItem("CustomerInfo", JSON.stringify(saved));
      setFastCheckout(true);
    }
  };

  /* OTP Input Logic */
  const handleOtpChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);

    if (val && i < 5) inputRefs.current[i + 1].focus();
  };

  const handleOtpBackspace = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs.current[i - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");

    if (!/^\d{6}$/.test(text)) return;

    const newOtp = text.split("");
    setOtp(newOtp);
    inputRefs.current[5].focus();
  };

  /* Copy code */
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedOtp);
      setCopySuccess(true);
      showToast("Code copied!", "success");
      setTimeout(() => setDialogOpen(false), 1000);
    } catch {
      showToast("Failed to copy", "danger");
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-6 shadow-sm">
      <h2 className="text-sm font-medium text-neutral-900 tracking-wide">
        FAST CHECKOUT
      </h2>
      <p className="text-xs text-neutral-500 mt-1 mb-5">
        Verify your phone number
      </p>

      {/* Phone Input */}
      <div className="flex gap-2 flex-wrap">
        <select
          className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
          value={phoneCode}
          disabled={otpSent}
          onChange={(e) => setPhoneCode(e.target.value)}
        >
          {countryCodes.map((c) => (
            <option key={c.code} value={c.code}>
              {c.country} ({c.code})
            </option>
          ))}
        </select>

        <input
          type="tel"
          disabled={otpSent}
          placeholder="Phone number"
          className="flex-1 border border-neutral-300 rounded-md px-3 py-2 text-sm"
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {/* Send OTP / Verify OTP */}
      {!otpSent ? (
        <button
          onClick={sendOtp}
          className="mt-5 w-full bg-black text-white py-2.5 rounded-md text-xs tracking-wide hover:bg-neutral-900"
        >
          SEND OTP
        </button>
      ) : (
        <>
          {/* OTP Boxes */}
          <div
            className="flex justify-center gap-2 mt-5"
            onPaste={handleOtpPaste}
          >
            {otp.map((d, i) => (
              <input
                key={i}
                maxLength="1"
                value={d}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpBackspace(i, e)}
                ref={(el) => (inputRefs.current[i] = el)}
                className="w-10 h-10 sm:w-12 sm:h-12 border border-neutral-300 rounded-md text-center text-lg"
              />
            ))}
          </div>

          <button
            onClick={verifyOtp}
            className="mt-5 w-full bg-black text-white py-2.5 rounded-md text-xs tracking-wide hover:bg-neutral-900"
          >
            VERIFY OTP
          </button>

          <p
            className="text-xs text-neutral-500 mt-2 cursor-pointer underline"
            onClick={() => setOtpSent(false)}
          >
            Resend OTP
          </p>
        </>
      )}

      {userVerified && (
        <p className="text-green-600 text-xs mt-3">Phone Verified!</p>
      )}

      {/* OTP Dialog */}
      <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)}>
        <h3 className="text-base font-medium mb-4 text-neutral-900">
          Verification Code
        </h3>

        <div className="bg-neutral-100 p-3 rounded-lg text-center">
          <p className="text-sm text-neutral-600">Your code is:</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">
            {generatedOtp}
          </p>
        </div>

        <button
          onClick={copyCode}
          className={`mt-4 w-full py-2 text-xs rounded-md text-white ${
            copySuccess ? "bg-green-600" : "bg-black hover:bg-neutral-800"
          }`}
        >
          {copySuccess ? "Copied!" : "Copy Code"}
        </button>
      </Dialog>
    </div>
  );
};

export default FastCheckout;
