import { API_BASE_URL } from "/src/config/api.js";

export async function ApiAddAddress(data) {
  try {
    const res = await fetch(`${API_BASE_URL}Address/AddAddress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Server returned ${res.status}: ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error("❌ ApiAddAddress error:", err);
    return { status: false, message: err.message };
  }
}
