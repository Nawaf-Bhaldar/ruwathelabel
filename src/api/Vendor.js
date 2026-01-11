import { API_BASE_URL } from "/src/config/api.js";

// ----------------------
// Get Vendor by ID
// ----------------------
export async function GetVendorById(id) {
  try {
    const response = await fetch(
      `${API_BASE_URL}Vendor/GetVendorById?Id=${id}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      console.warn("Vendor API returned status:", response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching vendor info:", error);
    return null;
  }
}

// ----------------------
// Get Vendor by Email (for test login page)
// ----------------------

export async function GetVendorByEmail(email) {
  try {
    // Get all vendors
    const response = await fetch(`${API_BASE_URL}Vendor/GetAllVendors`);
    const data = await response.json();

    if (!data?.status || !Array.isArray(data.data)) {
      console.warn("Unexpected vendor API structure:", data);
      return null;
    }

    // Try to match email (case-insensitive)
    const vendor = data.data.find(
      (v) => v.email?.toLowerCase() === email.toLowerCase()
    );

    if (vendor) {
      console.log("✅ Found vendor:", vendor);
      return {
        vendorId: vendor.id, // store owner ID
        brandName: vendor.appUserBrand?.brandName || vendor.brandName,
        brandLogo:
          vendor.appUserBrand?.logoUrl || vendor.logoUrl || vendor.image,
      };
    } else {
      console.warn("❌ No vendor found for email:", email);
      return null;
    }
  } catch (error) {
    console.error("Error fetching vendor by email:", error);
    return null;
  }
}
