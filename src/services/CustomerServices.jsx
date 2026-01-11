import { API_BASE_URL } from "/src/config/api.js";

// ✅ Mock: Fetch existing customer by phone
export async function apiGetCustomersByPhone(phone) {
  try {
    const res = await fetch(
      `${API_BASE_URL}Account/GetCustomerByPhoneNumber?phoneNumber=${phone}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching customer by phone:", error);
    return { data: null, message: "Error fetching customer" };
  }
}

// ✅ Mock: Send OTP via Infobip (SMS API)
export async function sendOtpViaInfobip(phoneNumber, otpCode) {
  try {
    console.log(`📲 Mock OTP sent to ${phoneNumber}: ${otpCode}`);
    // If your backend has an API route, replace with:
    // const res = await fetch(`${API_BASE_URL}Sms/SendOtp`, { ... });
    // return await res.json();
    return { success: true };
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
}
