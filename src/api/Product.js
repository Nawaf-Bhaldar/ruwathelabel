export const API_BASE_URL = "https://api.mysera.co/api/";

export async function GetAllProductsByUserId(userId) {
  const response = await fetch(
    `${API_BASE_URL}Product/GetAllProductsByUserId?userId=${userId}`
  );
  const data = await response.json();
  return data;
}

export async function GetProductsByCollectionId(collectionId) {
  try {
    const url = `${API_BASE_URL}Product/GetProductsByCollectionId?collectionId=${collectionId}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn("⚠️ API returned status:", response.status, url);
      return { status: false, data: [] };
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("❌ Error fetching products by collection:", err);
    return { status: false, data: [] };
  }
}

export async function GetProductById(id) {
  const response = await fetch(
    API_BASE_URL + `Product/GetProductById?Id=${id}`,
    {
      method: "GET",
      headers: {
        // "Authorization": 'Bearer '+user.token
      },
    }
  );
  const data = await response.json();

  return data;
}
